export interface IMediaQueryData
{
	width?: any;
	height?: any;
	x?: any;
	y?: any;
	regX?: any;
	regY?: any;
	scaleX?: any;
	scaleY?: any;

	[name:string]:IMediaQueryData;
}

export interface IMediaQuery {
	[name:string]:IMediaQueryData
}
