export class Queue<T> {
    private data: Record<number, T> = {};
    private start: number = 0;
    private end: number = 0;

    public clear(): void {
        this.start = 0
        this.end = 0
        this.data = {}
    }

    public length(): number {
        return this.end - this.start;
    }

    public isEmpty(): boolean {
        return this.length() === 0;
    }

    public enqueue(item: T): void {
        this.data[this.end] = item;
        this.end += 1;
    }

    public showNext(): T {
        return this.data[this.start];
    }

    public dequeue(): T {
        const value = this.data[this.start];
        delete this.data[this.start];
        this.start += 1;
        return value;
    }
}
