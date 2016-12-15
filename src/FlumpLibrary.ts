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
import {FlumpTexture} from "./flump/FlumpTexture";

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
			var prom = (<any> fetch)(url);

			return <Promise<FlumpLibrary>> prom.then(res => res.json()).then((json:ILibrary) =>
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
	protected _loadingPromise:Promise<FlumpLibrary> = null;

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
		return this._loadingPromise != null;
	}

	public load():Promise<FlumpLibrary>
	{
		if(!this.url)
		{
			throw new Error('url is not set and there for can not be loaded');
		}

		if(!this._loadingPromise)
		{
			this._loadingPromise = FlumpLibrary.load(this.url, this).then(library => {
				this._hasLoaded = true;
				return library;
			}).catch((err) => {
				throw err;
			});
		}

		return this._loadingPromise;
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

export class Animator {

	protected library:FlumpLibrary;

	protected fps:number;
	protected duration:number;

	constructor(path:string){
		this.library = new FlumpLibrary(path);
		this.library.load();
	}

	/**
	 *
	 * @param movieClipName
	 * @param ctx
	 * @param replace
	 * @returns {Promise<FlumpLibrary>}
	 */
	public generate({movieClipName, ctx, replace}:{movieClipName:string, ctx:any, replace?:{[name:string]:FlumpTexture}}):Promise<() => boolean>
	{
		return this.library.load().then(library => {
			var movie = library.createMovie(movieClipName);
			movie.play();

			if(replace)
			{
				for(var name in replace)
				{
					if(replace.hasOwnProperty(name))
					{
						movie.replaceSymbol(name, replace[name]);
					}
				}
			}

			var fps = movie.fps;
			var duration = movie.frames / fps * 1000;
			var fpms = 1000 / fps;

			var currentTime = 0;

			var callback = () => {
				// console.log(duration, currentTime);
				if(duration > currentTime)
				{
					ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
					movie.onTick(fpms);
					movie.draw(ctx);

					currentTime += fpms;

					return true;
				} else {
					return false;
				}
			}

			return callback;
		});
	}
}
