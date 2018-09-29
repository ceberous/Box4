const FirefoxWrapper = require( "firefox-wrapper" );

// Centralized Firefox
let FFManager;

function YOUTUBE() {
	return new Promise( async function( resolve , reject ) {
		try {
			FFManager = new FirefoxWrapper();
			await FFManager.launch();
			await FFManager.openNewTab( "http://localhost:6969/youtube" );		
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
			await FFManager.sleep( 1000 );
			FFManager.x.pressKeyboardKey( "f" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}
module.exports.youtubeFullScreen = YOUTUBE_FULLSCREEN;