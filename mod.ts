class LRU<K, V> extends Map<K, V> {
	readonly maxSize: number;

	constructor(maxSize: number, entries?: readonly (readonly [K, V])[] | null) {
		super(
			entries?.slice(Math.max(entries.length - maxSize, 0), entries.length)
		);
		this.maxSize = maxSize;
	}

	get #head(): K {
		return this.keys().next().value;
	}

	peek(key: K): V | undefined {
		return super.get(key);
	}

	get(key: K): V | undefined {
		const item = this.peek(key);
		if (item !== undefined) {
			super.delete(key);
			super.set(key, item);
		}
		return item;
	}

	set(key: K, value: V): this {
		super.delete(key);
		if (this.size === this.maxSize) {
			super.delete(this.#head);
		}
		super.set(key, value);
		return this;
	}
}

export default LRU;
