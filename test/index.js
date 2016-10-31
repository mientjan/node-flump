var path = require('path');
var FlumpLibrary = require('../dist/FlumpLibrary').FlumpLibrary;
var fs = require('fs');
var Canvas = require('canvas');
var spawn = require('child_process').spawn;

var url = path.normalize(__dirname + '/' + './flash/default/parisian_flump_test');

var callbackLoop = function(validator, callback, complete){

	var cbl = function(){

		if(validator())
		{
			complete();
		} else {
			callback(cbl);
		}
	}

	cbl();

}

var library = new FlumpLibrary(url);
library.load().then(() => {

	try {
		var movie = library.createMovie('anim');
		movie.play();
		var canvas = new Canvas(600, 900);
		var ctx = canvas.getContext('2d');

		var time = 3000;
		var fps = 1000 / 24;
		var timer = 0;
		var count = 0;


		callbackLoop(() => {

			if(timer >= time){
				return true;
			}

			timer += fps;
			count++;
			console.log(count);

			return false;
		}, (cb) => {
			movie.onTick(fps);
			movie.draw(ctx);


			var out = fs.createWriteStream(__dirname + `/output/text${String("000" + count).slice(-3)}.png`);
			var stream = canvas.pngStream();

			stream.on('data', function(chunk){
				out.write(chunk);
			});

			stream.on('end', function(){
				console.log('saved');
				ctx.clearRect(0, 0, 600, 900);
				cb();
			});

		}, () => {
			console.log('complete');

			var args = ['-i','output/text%03d.png', 'output.gif'];
			// ffmpeg -i %03d.png output.gif
			const ffmpeg = spawn('ffmpeg', args);
			console.log(args.join(' '));

			ffmpeg.stdout.on('data', (data) => {
				console.log(`stdout: ${data}`);
			});

			ffmpeg.stderr.on('data', (data) => {
				console.log(`stderr: ${data}`);
			});

			ffmpeg.on('close', (code) => {

			});
		})




	} catch(err){
		console.log(err);
	}
}).catch(err => {
	throw err;
});

