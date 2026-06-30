import {
  getDefaultModelKey,
  getPublicModelOptions,
} from '../server/ai/modelConfig.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.statusCode = 405;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  response.setHeader('Cache-Control', 'no-store');
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify({
    defaultModelKey: getDefaultModelKey(),
    models: getPublicModelOptions(),
  }));
}
