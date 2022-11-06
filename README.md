# LRU Store

This is an LRU Cache implementation using Map as the native Map guarantees the order of the of the [key, value] pairs to be maintained in the insertion order.

The LRU allows to use anything as key/value just like Map, and it follows the same interface as a Map, with the addition of `peek` method and `maxSize` property.

## Usage Deno

```ts
import LRU from "https://deno.land/x/lru_store/mod.ts";
```

## Usage Node

```bash
npm install --save @denox/lru_store
```

```js
import LRU from "@denox/lru_store";
```

## API

### Initialization

The first argument is `maxSize` and it is required, the second one is `entries` and it is optional, allowing prepopulating the cache.

```js
const lru = new LRU(100); // Creates an empty LRU Cache with 100 entries capacity
const lruWithData = new LRU(100, [
	["key1", "value1"],
	["key2", "value2"],
]); // Creates an LRU Cache with 2 entries and 100 entries capacity
```

### Set

Add a key/value pair to the cache. If the cache will exceed capacity, it will evict the oldest key/value pair.

```js
lru.set("key", "value");
```

### Get

Retrieve a value from the cache based on the keys, it will return undefined if the key is not found.

```js
lru.get("key");
```

### Peek

Retrieve the value from the cache based on the key, similar with `get` but without changing the priority of the queue.

```js
// Same behavior as get but without moving the key/value to the end of the eviction queue
lru.peek("key");
```

### Has

Check if a key is inside the LRU, returning `true` if found or `false` if not.

```js
lru.has("key");
```

### Delete

Evict the key/value pair based on key, returning `true` if found or `false` if not.

```js
lru.delete("key");
```

### Clear

Evict everything from the cache, leaving the LRU empty.

```js
lru.clear();
```

### Size

Get the current size of the LRU.

```js
lru.size; // Number
```

### MaxSize

Get the set capacity of the LRU, `size` should never exceed `maxSize`.

```js
lru.maxSize; // Number
```

### Keys, Values, Entries

Get the iterators for `keys`, `values` or `entries` in the eviction order.

```js
Array.from(lru.keys()); // [key1, key2, ...]
Array.from(lru.values()); // [value1, value2, ...]
Array.from(lru.entries()); // [[key1, value1], [key2, value2], ...]
```

### ForEach

Iterate over the LRU entries in the eviction order.

```js
lru.forEach((value, key, lru) => {
	//...
});
```

## License

[MIT](LICENSE)
