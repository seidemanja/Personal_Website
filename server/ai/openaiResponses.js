import { buildChatInput, buildStaticPromptPrefix, getPromptCacheKey } from './prompt.js';
import { resolveModel } from './modelConfig.js';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

function writeSse(response, event, payload) {
  return response.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
}

function sendUsageLog({ modelKey, model, usage, latencyMs, status = 'ok' }) {
  console.info('ai-chat usage', {
    status,
    modelKey,
    model,
    latencyMs,
    input_tokens: usage?.input_tokens ?? null,
    output_tokens: usage?.output_tokens ?? null,
    cached_tokens: usage?.input_tokens_details?.cached_tokens ?? null,
  });
}

function parseOpenAIStreamChunk(buffer, onEvent) {
  const events = buffer.split('\n\n');
  const remainder = events.pop() || '';

  for (const eventText of events) {
    const lines = eventText.split(/\r?\n/);
    const dataLines = lines
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart());

    if (!dataLines.length) {
      continue;
    }

    const data = dataLines.join('\n');

    if (data === '[DONE]') {
      continue;
    }

    try {
      onEvent(JSON.parse(data));
    } catch {
      // Ignore malformed partial events; the next chunk will carry a valid event.
    }
  }

  return remainder;
}

export async function streamOpenAIResponse({
  response,
  modelKey,
  message,
  history,
  isWarmup = false,
  signal,
  debugLog,
}) {
  const selectedModel = resolveModel(modelKey);
  const staticPromptPrefix = await buildStaticPromptPrefix();
  const input = buildChatInput({ history, message, isWarmup });
  const startedAt = Date.now();

  debugLog?.('server.openai_request_start', {
    modelKey: selectedModel.key,
  });

  const openAiResponse = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel.model,
      instructions: staticPromptPrefix,
      input,
      stream: true,
      max_output_tokens: isWarmup ? 16 : 900,
      prompt_cache_key: getPromptCacheKey(),
    }),
    signal,
  });

  debugLog?.('server.openai_response_headers_received', {
    status: openAiResponse.status,
  });

  if (!openAiResponse.ok || !openAiResponse.body) {
    const errorText = await openAiResponse.text().catch(() => '');
    throw new Error(
      `OpenAI returned ${openAiResponse.status}: ${errorText.slice(0, 300)}`,
    );
  }

  response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  response.setHeader('Cache-Control', 'no-cache, no-transform');
  response.setHeader('Connection', 'keep-alive');
  response.setHeader('X-Accel-Buffering', 'no');
  response.statusCode = 200;
  response.flushHeaders?.();

  const reader = openAiResponse.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completedUsage = null;
  let hasLoggedFirstOpenAiChunk = false;
  let hasLoggedFirstClientWrite = false;
  let clientWriteLogCount = 0;
  let cumulativeCharacters = 0;

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      if (!hasLoggedFirstOpenAiChunk) {
        hasLoggedFirstOpenAiChunk = true;
        debugLog?.('server.first_openai_chunk_received', {
          approximate_chunk_bytes: value?.byteLength ?? 0,
        });
      }

      buffer += decoder.decode(value, { stream: true });
      buffer = parseOpenAIStreamChunk(buffer, (event) => {
        if (event.type === 'response.output_text.delta' && event.delta) {
          const chunkLength = event.delta.length;
          cumulativeCharacters += chunkLength;
          const writeReturned = writeSse(response, 'delta', {
            text: event.delta,
          });

          if (!hasLoggedFirstClientWrite) {
            hasLoggedFirstClientWrite = true;
            debugLog?.('server.first_chunk_written_to_client', {
              approximate_chunk_characters: chunkLength,
              cumulative_characters: cumulativeCharacters,
              immediate_write_attempted: true,
              write_returned: writeReturned,
            });
          }

          if (clientWriteLogCount < 10) {
            clientWriteLogCount += 1;
            debugLog?.('server.chunk_written_to_client', {
              chunk_index: clientWriteLogCount,
              approximate_chunk_characters: chunkLength,
              cumulative_characters: cumulativeCharacters,
              immediate_write_attempted: true,
              write_returned: writeReturned,
            });
          }
        }

        if (event.type === 'response.completed') {
          completedUsage = event.response?.usage || null;
        }

        if (event.type === 'response.failed' || event.type === 'error') {
          writeSse(response, 'error', {});
        }
      });
    }

    sendUsageLog({
      modelKey: selectedModel.key,
      model: selectedModel.model,
      usage: completedUsage,
      latencyMs: Date.now() - startedAt,
    });
    debugLog?.('server.stream_complete', {
      cumulative_characters: cumulativeCharacters,
    });
    writeSse(response, 'done', {
      usage: {
        input_tokens: completedUsage?.input_tokens ?? null,
        output_tokens: completedUsage?.output_tokens ?? null,
        cached_tokens:
          completedUsage?.input_tokens_details?.cached_tokens ?? null,
      },
    });
  } finally {
    response.end();
  }
}
