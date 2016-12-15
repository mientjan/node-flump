import { IFlumpMovie } from "./IFlumpMovie";
import { ITexture } from "./IFlumpLibrary";
import { DisplayType } from "../enum/DisplayType";
import * as Canvas from "canvas";
export declare class FlumpTexture implements IFlumpMovie {
    type: DisplayType;
    name: string;
    time: number;
    renderTexture: Canvas.Image;
    originX: number;
    originY: number;
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(renderTexture: Canvas.Image, json: ITexture);
    onTick(delta: number): void;
    draw(ctx: CanvasRenderingContext2D): boolean;
    reset(): void;
}
