import {Promise} from "./Promise";
import * as Canvas from "canvas";
import * as fs from "fs";

export function loadImage(url):Promise<Canvas.Image>
{
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
	});
}