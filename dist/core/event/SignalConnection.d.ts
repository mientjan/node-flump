import { SignalAbstract } from "./SignalAbstract";
export declare class SignalConnection {
    _next: SignalConnection;
    _signal: SignalAbstract;
    _listener: Function;
    stayInList: boolean;
    /**
     *
     * @param {SignalAbstract} signal
     * @param {Function} listener
     */
    constructor(signal: SignalAbstract, listener: Function);
    /**
     * Only dispatches once
     * @returns {SignalConnection}
     */
    once(): SignalConnection;
    /**
     * Throws away the signal
     */
    dispose(): void;
}
