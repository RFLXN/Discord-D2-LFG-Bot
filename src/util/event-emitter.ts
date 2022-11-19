import { EventEmitter } from "events";

interface EventTypes {
    [eventName: string]: [...any];
}

type AnyListener = (...args: any[]) => void;

class TypedEventEmitter<E extends EventTypes> extends EventEmitter {
    public constructor() {
        super({ captureRejections: false });
    }

    public typedOn<K extends keyof E>(eventName: K, listener: (...args: E[K]) => void): this {
        return super.on(eventName as string, listener as AnyListener);
    }

    public typedOnce<K extends keyof E>(eventName: K, listener: (...args: E[K]) => void): this {
        return super.once(eventName as string, listener as AnyListener);
    }

    public typedOff<K extends keyof E>(eventName: K, listener: (...args: E[K]) => void): this {
        return super.off(eventName as string, listener as AnyListener);
    }

    public typedEmit<K extends keyof E>(eventName: K, ...args: E[K]): boolean {
        return super.emit(eventName as string, ...args);
    }

    public typedRemoveListener<K extends keyof E>(eventName: K, listener: (...args: E[K]) => void): this {
        return super.removeListener(eventName as string, listener as AnyListener);
    }
}

export { TypedEventEmitter, EventTypes };
