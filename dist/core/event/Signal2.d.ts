import { SignalAbstract } from "./SignalAbstract";
/**
 * @namespace createts.events
 * @module createts
 * @class Signal2
 */
export declare class Signal2<T1, T2> extends SignalAbstract {
    /**
     * Emit the signal, notifying each connected listener.
     *
     * @method emit
     */
    emit(arg1: T1, arg2: T2): void;
    private emitImpl(arg1, arg2);
}
