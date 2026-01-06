// storage/kv.ts
const store = new Map<string, any>();

export const kv = {
  get(key: string) {
    return store.get(key);
  },

  set(key: string, value: any) {
    store.set(key, value);
  },

  append(key: string, value: any) {
    const list = store.get(key) || [];
    list.push(value);
    store.set(key, list);
  }
};
