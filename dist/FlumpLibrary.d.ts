import { FlumpMovieData } from "./flump/FlumpMovieData";
import { FlumpTextureGroup } from "./flump/FlumpTextureGroup";
import { FlumpMovie } from "./flump/FlumpMovie";
import { IFlumpMovie } from "./flump/IFlumpMovie";
import { ILibrary } from "./flump/IFlumpLibrary";
import { ILoadable } from "./core/interface/ILoadable";
import { Promise } from "./core/util/Promise";
import { FlumpTexture } from "./flump/FlumpTexture";
export declare class FlumpLibrary implements ILoadable<FlumpLibrary> {
    static EVENT_LOAD: string;
    static load(url: string, flumpLibrary?: FlumpLibrary): Promise<FlumpLibrary>;
    movieData: Array<FlumpMovieData>;
    textureGroups: Array<FlumpTextureGroup>;
    url: string;
    md5: string;
    frameRate: number;
    referenceList: Array<string>;
    fps: number;
    isOptimised: boolean;
    protected _hasLoaded: boolean;
    protected _isLoading: boolean;
    protected _loadingPromise: Promise<FlumpLibrary>;
    constructor(basePath?: string);
    hasLoaded(): boolean;
    isLoading(): boolean;
    load(): Promise<FlumpLibrary>;
    processData(json: ILibrary): Promise<FlumpLibrary>;
    getFlumpMovieData(name: string): FlumpMovieData;
    createSymbol(name: string, paused?: boolean): IFlumpMovie;
    createMovie(id: any): FlumpMovie;
    getNameFromReferenceList(value: string | number): string;
}
export declare class Animator {
    protected library: FlumpLibrary;
    protected fps: number;
    protected duration: number;
    constructor(path: string);
    /**
     *
     * @param movieClipName
     * @param ctx
     * @param replace
     * @returns {Promise<FlumpLibrary>}
     */
    generate({movieClipName, ctx, replace}: {
        movieClipName: string;
        ctx: any;
        replace?: {
            [name: string]: FlumpTexture;
        };
    }): Promise<() => boolean>;
}
