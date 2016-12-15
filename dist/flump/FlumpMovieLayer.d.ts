import { FlumpLayerData } from './FlumpLayerData';
import { FlumpMovie } from './FlumpMovie';
import { FlumpMtx } from './FlumpMtx';
import { IFlumpMovie } from "./IFlumpMovie";
import { IHashMap } from "../core/interface/IHashMap";
import { DisplayObject } from "../core/DisplayObject";
export declare class FlumpMovieLayer extends DisplayObject {
    name: string;
    private _frame;
    flumpLayerData: FlumpLayerData;
    protected _symbol: IFlumpMovie;
    _symbols: IHashMap<IFlumpMovie>;
    protected _symbolName: any;
    enabled: boolean;
    _storedMtx: FlumpMtx;
    constructor(flumpMove: FlumpMovie, flumpLayerData: FlumpLayerData);
    getSymbol(name: string): FlumpMovie;
    replaceSymbol(name: string, item: IFlumpMovie): boolean;
    onTick(delta: number, accumulated: number): void;
    setFrame(frame: number): boolean;
    setKeyframeData(keyframe: any, frame: any): void;
    reset(): void;
    draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean): boolean;
}
