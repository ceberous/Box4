const FirefoxWrapper = require( "firefox-wrapper" );

// Centralized Firefox
let FFManager;

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