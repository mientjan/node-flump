import { FlumpLibrary } from '../FlumpLibrary';
import { FlumpTextureGroupAtlas } from './FlumpTextureGroupAtlas';
import { FlumpTexture } from './FlumpTexture';
import { ITextureGroup } from "./IFlumpLibrary";
import { IHashMap } from "../core/interface/IHashMap";
import { Promise } from '../core/util/Promise';
export declare class FlumpTextureGroup {
    static load(flumpLibrary: FlumpLibrary, json: ITextureGroup): Promise<FlumpTextureGroup>;
    flumpTextureGroupAtlases: Array<FlumpTextureGroupAtlas>;
    flumpTextures: IHashMap<FlumpTexture>;
    constructor(flumpTextureGroupAtlases: Array<FlumpTextureGroupAtlas>, flumpTextures: IHashMap<FlumpTexture>);
}
