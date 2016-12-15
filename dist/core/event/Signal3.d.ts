import { SignalAbstract } from "./SignalAbstract";
/**
 * @namespace core.events
 * @module weasel
 * @class Signal3
 */
export declare class Signal3<T1, T2, T3> extends SignalAbstract {
    /**
     * Emit the signal, notifying each connected listener.
     *
     * @method emit
     */
    emit(arg1: T1, arg2: T2, arg3: T3): void;
    private emitImpl(arg1, arg2, arg3);
}
