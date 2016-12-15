import { FlumpLibrary } from "../FlumpLibrary";
import { FlumpLayerData } from "./FlumpLayerData";
import { IMovie } from "./IFlumpLibrary";
export declare class FlumpMovieData {
    id: string;
    flumpLibrary: any;
    flumpLayerDatas: Array<FlumpLayerData>;
    frames: number;
    constructor(flumpLibrary: FlumpLibrary, json: IMovie);
}
