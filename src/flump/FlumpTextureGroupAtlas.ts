import {FlumpLibrary} from '../FlumpLibrary';
import {Promise} from '../core/util/Promise';
import {IAtlas} from "./IFlumpLibrary";
import {FlumpTexture} from "./FlumpTexture";
import {IHashMap} from "../core/interface/IHashMap";
import * as Canvas from "canvas";
import * as fs from "fs";

export class FlumpTextureGroupAtlas
{
	public static load(flumpLibrary:FlumpLibrary, json:IAtlas):Promise<FlumpTextureGroupAtlas>
	{
		var file = json.file;
		var url = flumpLibrary.url + '/' + file;

		return new Promise(function(resolve, reject){
			var img = new Canvas.Image;
			fs.readFile(url, function(err, imageData){

				if(err){
					reject();
				} else {
					img.src = imageData;
					resolve(img);
				}
			});
		}).then((data:HTMLImageElement) => {
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

