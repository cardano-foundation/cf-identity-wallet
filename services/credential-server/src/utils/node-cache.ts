import NodeCache from "node-cache";

const myCache = new NodeCache();

function setCache(key: string, value: string, ttl: number | string) {
  return myCache.set(key, value, ttl);
}

function getCache(key: string): string {
  return myCache.get(key) as string;
}

export { setCache, getCache };
