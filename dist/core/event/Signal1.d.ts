import { SignalAbstract } from "./SignalAbstract";
/**
 * @namespace createts.events
 * @module createts
 * @class Signal1
 */
export declare class Signal1<T> extends SignalAbstract {
    /**
     * Emit the signal, notifying each connected listener.
     *
     * @method emit
     */
    emit(arg1: T): void;
    private emitImpl(arg1);
}
