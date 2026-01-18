class FixedSizeQueue {
    constructor(capacity) {
        if (!Number.isInteger(capacity) || capacity <= 0) {
            throw new Error("Capacity must be a positive integer")
        }
        this.buffer = new Array(capacity)
        this.capacity = capacity
        this.head = 0  // Vanhin
        this.tail = 0  // Uusin
        this.size = 0
    }

    enqueue(item) {
        let overwritten = null
        if (this.size === this.capacity) {
            console.warn("Overwrite old!")
            overwritten = this.buffer[this.head]
            this.head = (this.head + 1) % this.capacity
        } else {
            this.size++
        }
        this.buffer[this.tail] = item
        this.tail = (this.tail + 1) % this.capacity
        return overwritten
    }

    dequeue() {
        if (this.size === 0) return undefined
        const item = this.buffer[this.head]
        this.head = (this.head + 1) % this.capacity
        this.size--
        return item
    }

    peek() {
        if (this.size === 0) return undefined
        return this.buffer[this.head]
    }

    isFull() {
        return this.size === this.capacity
    }

    isEmpty() {
        return this.size === 0
    }

    getSize() {
        return this.size
    }

    toArray() {
        const result = []
        for (let i = 0; i < this.size; i++) {
            result.push(this.buffer[(this.head + i) % this.capacity])
        }
        return result
    }
}

module.exports = { FixedSizeQueue }