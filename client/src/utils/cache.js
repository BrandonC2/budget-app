const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cache = {
  data: new Map(),
  timestamps: new Map(),

  set(key, value) {
    this.data.set(key, value);
    this.timestamps.set(key, Date.now());
  },

  get(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp) return null;

    const age = Date.now() - timestamp;
    if (age > CACHE_DURATION) {
      this.data.delete(key);
      this.timestamps.delete(key);
      return null;
    }

    return this.data.get(key);
  },

  clear(key) {
    this.data.delete(key);
    this.timestamps.delete(key);
  },

  clearAll() {
    this.data.clear();
    this.timestamps.clear();
  }
};

export const useCache = () => {
  const getCachedData = (key) => cache.get(key);
  
  const setCachedData = (key, value) => {
    cache.set(key, value);
  };
  
  const clearCache = (key) => {
    if (key) {
      cache.clear(key);
    } else {
      cache.clearAll();
    }
  };

  return {
    getCachedData,
    setCachedData,
    clearCache
  };
}; 