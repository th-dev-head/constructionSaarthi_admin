const requestCache = new Set();
const responseCache = new Map();

export const buildRequestKey = (prefix, params = {}) =>
  `${prefix}:${JSON.stringify(params || {})}`;

export const shouldSkipCachedRequest = ({
  prefix,
  params = {},
  hasData,
  isLoading,
}) => {
  if (params?.force) return false;
  if (isLoading) return true;
  if (!hasData) return false;

  const key = buildRequestKey(prefix, params);
  return requestCache.has(key);
};

export const markRequestCached = (prefix, params = {}) => {
  const key = buildRequestKey(prefix, params);
  requestCache.add(key);
};

export const clearRequestCacheByPrefix = (prefix) => {
  Array.from(requestCache).forEach((key) => {
    if (key.startsWith(`${prefix}:`)) {
      requestCache.delete(key);
    }
  });
};

export const getCachedResponse = (key) => responseCache.get(key);

export const setCachedResponse = (key, data) => {
  responseCache.set(key, data);
};

export const clearCachedResponseByPrefix = (prefix) => {
  Array.from(responseCache.keys()).forEach((key) => {
    if (key.startsWith(`${prefix}:`)) {
      responseCache.delete(key);
    }
  });
};
