


import {FlumpMovieData} from "./flump/FlumpMovieData";
import {FlumpTextureGroup} from "./flump/FlumpTextureGroup";
import {FlumpMovie} from "./flump/FlumpMovie";
import {IFlumpMovie} from "./flump/IFlumpMovie";
import {ILibrary} from "./flump/IFlumpLibrary";
import {ILoadable} from "./core/interface/ILoadable";
import {Promise} from "./core/util/Promise";
import * as fetch from "node-fetch";
import {QueueItem} from "./core/util/QueueItem";
import * as validUrl from 'valid-url';
import * as fs from 'fs-extra';

export class FlumpLibrary implements ILoadable<FlumpLibrary>
{
	public static EVENT_LOAD = 'load';

	public static load(url:string, flumpLibrary?:FlumpLibrary):Promise<FlumpLibrary>
	{
		var baseDir = url;

		if(url.indexOf('.json') > -1)
		{
			baseDir = url.substr(0, url.lastIndexOf('/'));
		} else {

			if(baseDir.substr(-1) == '/')
			{
				baseDir = baseDir.substr(0, baseDir.length - 1);
			}

			url += ( url.substr(url.length-1) != '/' ? '/' : '' ) +  'library.json';
		}

		if(flumpLibrary == void 0)
		{
			flumpLibrary = new FlumpLibrary(baseDir);
		} else {
			flumpLibrary.url = baseDir;
		}

		if(validUrl.isUri(url))
		{
			return fetch(url).then(res => res.json()).then((json:ILibrary) =>
			{
				return flumpLibrary.processData(json);
			});
		} else {
			return new Promise((resolve) => {
				fs.readJson(url, function (err, json) {
					flumpLibrary.processData(json).then(result => {
						resolve(result)
					});
				})
			})
		}

	}

	public movieData:Array<FlumpMovieData> = [];
	public textureGroups:Array<FlumpTextureGroup> = [];

	public url:string;
	public md5:string;
	public frameRate:number;
	public referenceList:Array<string>;

	public fps:number = 0;
	public isOptimised:boolean = false;

	protected _hasLoaded:boolean = false;
	protected _isLoading:boolean = false;

	constructor(basePath?:string)
	{
		if(basePath)
		{
			this.url = basePath;
		}
	}

	public hasLoaded():boolean
	{
		return this._hasLoaded;
	}

	public isLoading():boolean
	{
		return this._isLoading;
	}

	public load():Promise<FlumpLibrary>
	{
		if( this.hasLoaded() )
		{
			return new Promise<FlumpLibrary>((resolve:Function, reject:Function) => {
				resolve(this);
			});
		}

		if(!this.url)
		{
			throw new Error('url is not set and there for can not be loaded');
		}

		return FlumpLibrary.load(this.url, this).catch((err) => {
			throw err;
		});
	}

	public processData(json:ILibrary):Promise<FlumpLibrary>
	{

		this.md5 = json.md5;
		this.frameRate = json.frameRate;
		this.referenceList = json.referenceList || null;
		this.isOptimised = json.optimised || false;

		var textureGroupLoaders:Array<Promise<FlumpTextureGroup>> = [];
		for(var i = 0; i < json.movies.length; i++)
		{
			var flumpMovieData = new FlumpMovieData(this, json.movies[i]);
			this.movieData.push(flumpMovieData);
		}

		var textureGroups = json.textureGroups;
		for(var i = 0; i < textureGroups.length; i++)
		{
			var textureGroup = textureGroups[i];
			var promise = FlumpTextureGroup.load(this, textureGroup);
			textureGroupLoaders.push(promise);
		}

		return Promise.all(textureGroupLoaders)
			.then((textureGroups:Array<FlumpTextureGroup>) => {

				for(var i = 0; i < textureGroups.length; i++)
				{
					var textureGroup = textureGroups[i];
					this.textureGroups.push(textureGroup);
				}


				this._hasLoaded = true;
				return this;
			});
	}

	public getFlumpMovieData(name:string):FlumpMovieData
	{
		for(var i = 0; i < this.movieData.length; i++)
		{
			var movieData = this.movieData[i];
			if(movieData.id == name)
			{
				return movieData;
			}
		}

		throw new Error('movie not found');
	}

	public createSymbol(name:string, paused:boolean = false):IFlumpMovie
	{
		for(var i = 0; i < this.textureGroups.length; i++)
		{
			var flumpTextures = this.textureGroups[i].flumpTextures;

			if(name in flumpTextures)
			{
				return flumpTextures[name];
			}
		}

		for(var i = 0; i < this.movieData.length; i++)
		{
			var movieData = this.movieData[i];
			
			if(movieData.id == name)
			{
				var movie = new FlumpMovie(this, name);
				movie.getQueue().add(new QueueItem(null, 0, movie.frames, -1, 0))
				movie.paused = paused;
				return movie;
			}

		}

		console.warn('no _symbol found: (' + name + ')');

		throw new Error("no _symbol found");
	}

	public createMovie(id:any):FlumpMovie
	{
		if(this.referenceList)
		{
			var name:any = this.referenceList.indexOf(id);
		}
		else
		{
			var name:any = id;
		}

		for(var i = 0; i < this.movieData.length; i++)
		{
			var movieData = this.movieData[i];
			if(movieData.id == <any> name)
			{
				var movie = new FlumpMovie(this, <any> name);
				movie.paused = true;
				return movie;
			}
		}

		console.warn('no _symbol found: (' + name + ') ', this);

		throw new Error("no _symbol found: " + this);
	}

	public getNameFromReferenceList(value:string|number):string
	{
		if(this.referenceList && typeof value == 'number')
		{
			return this.referenceList[<number> value];
		}

		return <string> value;
	}
}

