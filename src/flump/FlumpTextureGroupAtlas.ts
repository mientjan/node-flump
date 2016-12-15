import {FlumpLibrary} from '../FlumpLibrary';
import {Promise} from '../core/util/Promise';
import {IAtlas} from "./IFlumpLibrary";
import {FlumpTexture} from "./FlumpTexture";
import {IHashMap} from "../core/interface/IHashMap";
import * as Canvas from "canvas";
import * as fs from "fs";
import {loadImage} from "../core/util/loadImage";

export class FlumpTextureGroupAtlas
{
	public static load(flumpLibrary:FlumpLibrary, json:IAtlas):Promise<FlumpTextureGroupAtlas>
	{
		var file = json.file;
		var url = flumpLibrary.url + '/' + file;

		return loadImage(url).then((data:Canvas.Image) => {
			return new FlumpTextureGroupAtlas(data, json);
		});
	}

	public renderTexture:HTMLImageElement;
	public flumpTextures:IHashMap<FlumpTexture> = {};

	constructor( renderTexture:HTMLImageElement, json:IAtlas)
	{
		this.renderTexture = renderTexture;

		var textures = json.textures;
		for(var i = 0; i < textures.length; i++)
		{
			var texture = textures[i];
			this.flumpTextures[texture.symbol] = new FlumpTexture(renderTexture, texture);
		}
	}
}

