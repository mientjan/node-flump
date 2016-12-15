import { SignalAbstract } from "./SignalAbstract";
/**
 * @namespace createts.events
 * @module createts
 * @class Signal
 */
export declare class Signal extends SignalAbstract {
    /**
     * Emit the signal, notifying each connected listener.
     *
     * @method emit
     */
    emit(): void;
    private emitImpl();
}
