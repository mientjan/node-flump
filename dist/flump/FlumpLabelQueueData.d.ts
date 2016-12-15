import { FlumpLabelData } from './FlumpLabelData';
export declare class FlumpLabelQueueData extends FlumpLabelData {
    times: number;
    delay: number;
    private _complete;
    constructor(label: string, index: number, duration: number, times?: number, delay?: number);
    then(complete: () => any): FlumpLabelQueueData;
    finish(): FlumpLabelQueueData;
    destruct(): void;
}
