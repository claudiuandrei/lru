import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import LRU from "./mod.ts";

type Pair = [string, string];

const MAX_SIZE = 5;
const KV_PAIRS: Array<Pair> = Array.from(Array(MAX_SIZE).keys()).map((k) => [
	`key${k}`,
	`value${k}`,
]);

Deno.test("Initialization", async (t) => {
	await t.step(
		"New LRU object should reflect the maxSize when initialized",
		() => {
			const lru = new LRU(MAX_SIZE);
			assertEquals(lru.maxSize, 5);
		}
	);
	await t.step("New LRU object with no options should be empty", () => {
		const lru = new LRU(MAX_SIZE);
		assertEquals(lru.size, 0);
	});
	await t.step(
		"New LRU object from an iterator should be intitialized with the iterator's data",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			assertEquals(Array.from(lru.entries()), KV_PAIRS);
		}
	);
	await t.step(
		"New LRU object from an iterator that exceeds the max size should take only the first maxSize items from the iterator's data",
		() => {
			const lru = new LRU(MAX_SIZE - 1, KV_PAIRS);
			assertEquals(lru.size, MAX_SIZE - 1);
			assertEquals(Array.from(lru.entries()), KV_PAIRS.slice(1, MAX_SIZE));
		}
	);
});

Deno.test("Set", async (t) => {
	await t.step("Set should add a key/value pair in the LRU object", () => {
		const lru = new LRU(MAX_SIZE);
		const pair: Pair = ["test1", "new_value"];
		lru.set(pair[0], pair[1]);
		assertEquals(Array.from(lru.entries()), [pair]);
	});
	await t.step(
		"Set should replace the existing value if set previously",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			const [key, value]: Pair = ["key1", "new_value"];
			assertEquals(lru.get(key), KV_PAIRS.find((k) => k[0] === key)?.[1]);
			lru.set(key, value);
			assertEquals(lru.get(key), value);
		}
	);
	await t.step(
		"Set should move the key/value pair at the bottom of the LRU object",
		() => {
			const lru = new LRU(MAX_SIZE + 1, KV_PAIRS);
			const pair: Pair = ["test1", "new_value"];
			lru.set(pair[0], pair[1]);
			assertEquals(Array.from(lru.entries()), [...KV_PAIRS, pair]);
		}
	);
	await t.step(
		"Set should drop the key/value pair at the top of the LRU object if exceeding maxSize",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			const pair: Pair = ["test1", "new_value"];
			lru.set(pair[0], pair[1]);
			assertEquals(Array.from(lru.entries()), [
				...KV_PAIRS.slice(1, MAX_SIZE),
				pair,
			]);
		}
	);
});

Deno.test("Get", async (t) => {
	await t.step("Get should retrieve a previously set value", () => {
		const lru = new LRU(MAX_SIZE);
		const [key, value]: Pair = ["test1", "new_value"];
		lru.set(key, value);
		assertEquals(lru.get(key), value);
	});
	await t.step(
		"Get should return 'undefined' if there is no previously set value",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			const [key, _]: Pair = ["test1", "new_value"];
			assertEquals(lru.get(key), undefined);
		}
	);
	await t.step(
		"Get should move existing key/value pair at the bottom of the LRU object",
		() => {
			const lru = new LRU(MAX_SIZE);
			const [pair0, pair1]: Array<Pair> = KV_PAIRS;
			lru.set(pair0[0], pair0[1]);
			lru.set(pair1[0], pair1[1]);
			lru.get(pair0[0]);
			assertEquals(Array.from(lru.entries()), [pair1, pair0]);
		}
	);
});

Deno.test("Peek", async (t) => {
	await t.step("Peek should retrieve a previously set value", () => {
		const lru = new LRU(MAX_SIZE);
		const [key, value]: Pair = ["test1", "new_value"];
		lru.set(key, value);
		assertEquals(lru.peek(key), value);
	});
	await t.step(
		"Peek should return 'undefined' if there is no previously set value",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			const [key, _]: Pair = ["test1", "new_value"];
			assertEquals(lru.peek(key), undefined);
		}
	);
	await t.step(
		"Peek should not move the key/value pair at the bottom of the LRU object",
		() => {
			const lru = new LRU(MAX_SIZE);
			const [pair0, pair1]: Array<Pair> = KV_PAIRS;
			lru.set(pair0[0], pair0[1]);
			lru.set(pair1[0], pair1[1]);
			lru.peek(pair0[0]);
			assertEquals(Array.from(lru.entries()), [pair0, pair1]);
		}
	);
});

Deno.test("Has", async (t) => {
	await t.step(
		"Has should return true if the key was found in the LRU object",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			const [[key]]: Array<Pair> = KV_PAIRS;
			assertEquals(lru.has(key), true);
		}
	);
	await t.step(
		"Has should return false if the key was not found in the LRU object",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			const key = "test1";
			assertEquals(lru.has(key), false);
		}
	);
});

Deno.test("Delete", async (t) => {
	await t.step(
		"Delete should remove the key/value pair from the LRU object",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			const [[key]]: Array<Pair> = KV_PAIRS;
			assertEquals(lru.has(key), true);
			lru.delete(key);
			assertEquals(lru.has(key), false);
		}
	);
	await t.step(
		"Delete should return true if the key was found and removed from the LRU object",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			const [[key]]: Array<Pair> = KV_PAIRS;
			assertEquals(lru.delete(key), true);
		}
	);
	await t.step(
		"Delete should return false if the key was not found in the LRU object",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			const key = "test1";
			assertEquals(lru.delete(key), false);
		}
	);
});

Deno.test("Clear", async (t) => {
	await t.step("Clear should remove all data from the LRU object", () => {
		const lru = new LRU(MAX_SIZE, KV_PAIRS);
		lru.clear();
		assertEquals(lru.size, 0);
	});
});

Deno.test("Size", async (t) => {
	await t.step(
		"Size should reflect the number of elements that are currently in the LRU Object",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			const [[key]]: Array<Pair> = KV_PAIRS;
			lru.delete(key);
			assertEquals(lru.size, Array.from(lru.entries()).length);
		}
	);
});

Deno.test("Keys", async (t) => {
	await t.step(
		"Keys should return an iterator with the keys in the order of eviction",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			assertEquals(
				Array.from(lru.keys()),
				KV_PAIRS.map(([k, _]) => k)
			);
		}
	);
});

Deno.test("Values", async (t) => {
	await t.step(
		"Values should return an iterator with the values in the order of eviction",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			assertEquals(
				Array.from(lru.values()),
				KV_PAIRS.map(([_, v]) => v)
			);
		}
	);
});

Deno.test("Entries", async (t) => {
	await t.step(
		"Entries should return an iterator of [key, value] in the order of eviction",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			assertEquals(Array.from(lru.entries()), KV_PAIRS);
		}
	);
});

Deno.test("ForEach", async (t) => {
	await t.step(
		"ForEach should iterate over the [key, value] pairs in the order of eviction",
		() => {
			const lru = new LRU(MAX_SIZE, KV_PAIRS);
			const output: Array<Pair> = [];
			lru.forEach((v, k) => {
				output.push([k, v]);
			});
			assertEquals(output, KV_PAIRS);
		}
	);
});
