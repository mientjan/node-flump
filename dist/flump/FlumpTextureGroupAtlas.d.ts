import { FlumpLibrary } from '../FlumpLibrary';
import { Promise } from '../core/util/Promise';
import { IAtlas } from "./IFlumpLibrary";
import { FlumpTexture } from "./FlumpTexture";
import { IHashMap } from "../core/interface/IHashMap";
export declare class FlumpTextureGroupAtlas {
    static load(flumpLibrary: FlumpLibrary, json: IAtlas): Promise<FlumpTextureGroupAtlas>;
    renderTexture: HTMLImageElement;
    flumpTextures: IHashMap<FlumpTexture>;
    constructor(renderTexture: HTMLImageElement, json: IAtlas);
}
