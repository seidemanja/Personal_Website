const DEFAULT_PRIMARY_MODEL = 'gpt-4.1';
const DEFAULT_FAST_MODEL = 'gpt-4.1-mini';

export function getModelConfig() {
  return {
    primary: {
      key: 'primary',
      label: 'Primary GPT model',
      provider: 'openai',
      model: process.env.OPENAI_MODEL || DEFAULT_PRIMARY_MODEL,
    },
    fast: {
      key: 'fast',
      label: 'Fast GPT model',
      provider: 'openai',
      model: process.env.OPENAI_FALLBACK_MODEL || DEFAULT_FAST_MODEL,
    },
  };
}

export function getPublicModelOptions() {
  return Object.values(getModelConfig()).map(({ key, model }) => ({
    key,
    label: model,
  }));
}

export function getDefaultModelKey() {
  return getModelConfig().primary.key;
}

export function resolveModel(modelKey) {
  const modelConfig = getModelConfig();

  return modelConfig[modelKey] || modelConfig[getDefaultModelKey()];
}
