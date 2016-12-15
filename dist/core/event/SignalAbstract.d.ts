/**
 * Signal provides method for managing queues of a single event listener and dispatching it.
 **/
import { SignalConnection } from "./SignalConnection";
export declare class Task {
    fn: Function;
    next: Task;
    constructor(fn: Function);
}
export declare class SignalAbstract {
    static DISPATCHING_SENTINEL: SignalConnection;
    private _head;
    private _deferredTasks;
    constructor(listener?: Function);
    /**
     *
     * @returns {boolean}
     */
    hasListeners(): boolean;
    /**
     *
     * @param {Function} listener
     * @param {boolean} prioritize
     * @returns {SignalConnection}
     */
    connect(listener: Function, prioritize?: boolean): SignalConnection;
    /**
     *
     * @param {SignalConnection} conn
     */
    disconnect(conn: SignalConnection): void;
    defer(fn: () => void): void;
    willEmit(): SignalConnection;
    didEmit(head: SignalConnection): void;
    dispatching(): boolean;
    listAdd(conn: SignalConnection, prioritize: boolean): void;
    listRemove(conn: SignalConnection): void;
}
