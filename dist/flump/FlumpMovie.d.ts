import { FlumpLibrary } from '../FlumpLibrary';
import { FlumpMovieLayer } from './FlumpMovieLayer';
import { IFlumpMovie } from "./IFlumpMovie";
import { DisplayObject } from "../core/DisplayObject";
import { IPlayable } from "../core/interface/IPlayable";
import { AnimationQueue } from "../core/util/AnimationQueue";
import { DisplayType } from "../enum/DisplayType";
import { QueueItem } from "../core/util/QueueItem";
/**
 * @author Mient-jan Stelling
 */
export declare class FlumpMovie extends DisplayObject implements IPlayable {
    type: DisplayType;
    flumpLibrary: FlumpLibrary;
    flumpMovieData: any;
    flumpMovieLayers: Array<FlumpMovieLayer>;
    private _labels;
    private _labelQueue;
    private _label;
    protected _queue: AnimationQueue;
    private hasFrameCallbacks;
    private _frameCallback;
    paused: boolean;
    name: string;
    frame: number;
    frames: number;
    speed: number;
    fps: number;
    constructor(flumpLibrary: FlumpLibrary, name: string);
    getQueue(): AnimationQueue;
    play(times?: number, label?: string | Array<number>, complete?: () => any): FlumpMovie;
    resume(): FlumpMovie;
    pause(): FlumpMovie;
    end(all?: boolean): FlumpMovie;
    stop(): FlumpMovie;
    next(): QueueItem;
    kill(): FlumpMovie;
    setFrameCallback(frameNumber: number, callback: () => any, triggerOnce?: boolean): FlumpMovie;
    gotoAndStop(frameOrLabel: number | string): FlumpMovie;
    onTick(delta: number, accumulated: number): void;
    /**
     *
     * @param name
     * @returns {any}
     */
    getSymbol(name: string): FlumpMovie;
    replaceSymbol(name: string, symbol: IFlumpMovie): boolean;
    handleFrameCallback(fromFrame: number, toFrame: number, delta: number): FlumpMovie;
    draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean): boolean;
    reset(): void;
}
