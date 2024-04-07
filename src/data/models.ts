import { Type } from "class-transformer"

export class Queue<T> {
    private data: Record<number, T> = {};
    private start: number = 0;
    private end: number = 0;

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

export class WebSocketMessage {
    type: WSMessageType = WSMessageType.Response
    payload?: string
}

export enum WSMessageType {
    Request = "request",
    Response = "response",
}

export class Project {
    uid!: string
    name!: string
}

export class SimulacrumState {
    @Type(() => ObjectInfo)
    objects: Array<ObjectInfo> = []
}

export class ObjectInfo {
    uid?: string
    type!: ObjectType

    @Type(() => Vector)
    position: Vector = new Vector()

    @Type(() => Vector)
    rotation: Vector = new Vector()
}

export enum ObjectType {
    Sphere = "sphere",
    Cube = "cube",
}

export class Vector {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
    ) { }
}
