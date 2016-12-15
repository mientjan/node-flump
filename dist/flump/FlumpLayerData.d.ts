import { FlumpKeyframeData } from "./FlumpKeyframeData";
import { ILayer } from "./IFlumpLibrary";
export declare class FlumpLayerData {
    name: string;
    flipbook: boolean;
    flumpKeyframeDatas: Array<FlumpKeyframeData>;
    frames: number;
    constructor(json: ILayer);
    getKeyframeForFrame(frame: number): FlumpKeyframeData;
    getKeyframeAfter(flumpKeyframeData: FlumpKeyframeData): FlumpKeyframeData;
}
