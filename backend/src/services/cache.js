const NodeCache = require("node-cache");

const ttlSeconds = Number(process.env.CACHE_TTL_SECONDS || 120);
const cache = new NodeCache({ stdTTL: ttlSeconds, useClones: false });

const getCacheKey = (prefix, params) => {
  const safeParams = params ? JSON.stringify(params) : "";
  return `${prefix}:${safeParams}`;
};

module.exports = { cache, getCacheKey };
