const FirefoxWrapper = require( "firefox-wrapper" );

// Centralized Firefox
let FFManager;

// function CALL_PROXY( ...args ) {
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			let real_arguments = args.pop();
// 			let real_call = FFManager;
// 			for ( let i = 0; i < args.length; ++i ) {
// 				real_call = real_call[ args[ i ] ]
// 			}
// 			console.log( "Calling Function === " );
// 			console.log( real_call );
// 			console.log( "Calling Arguments === " );
// 			console.log( real_arguments );
// 			await real_call( real_arguments );
// 			resolve();
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }
// module.exports.call = CALL_PROXY;

function CREATE_NEW( wURL ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( FFManager ) { await FFManager.close(); FFManager = undefined; }
			FFManager = new FirefoxWrapper();
			await FFManager.launch();
			await FFManager.openNewTab( wURL );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function CLOSE() {
	return new Promise( function( resolve , reject ) {
		try {
			if ( !FFManager ) { resolve(); return; }
			FFManager.close();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.close = CLOSE;

function YOUTUBE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await CREATE_NEW( "http://localhost:6969/youtube" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.youtube = YOUTUBE;

function YOUTUBE_FULLSCREEN() {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !FFManager ) { resolve(); return; }
			//FFManager.x.fullScreen();
			FFManager.x.centerMouse();
			await FFManager.sleep( 500 );
			FFManager.x.leftClick();
			await FFManager.sleep( 500 );
			FFManager.x.pressKeyboardKey( "f" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.youtubeFullScreen = YOUTUBE_FULLSCREEN;

function TWITCH( wUser ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await CREATE_NEW( "https://twitch.tv/" + wUser );
			await FFManager.x.sleep( 20000 );
			await TWITCH_FULLSCREEN();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.twitch = TWITCH;

function TWITCH_FULLSCREEN() {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !FFManager ) { resolve(); return; }
			FFManager.x.centerMouse();
			await FFManager.sleep( 500 );
			FFManager.x.leftClick();
			await FFManager.sleep( 500 );
			FFManager.x.pressKeyboardKey( "F11" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.twitchFullScreen = TWITCH_FULLSCREEN;

function TWITCH_PAUSE() {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !FFManager ) { resolve(); return; }
			FFManager.x.pressKeyboardKey( "space" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.twitchPause = TWITCH_PAUSE;