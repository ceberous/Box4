const FirefoxWrapper = require( "firefox-wrapper" );
// Centralized Firefox
let FFManager;

function YOUTUBE() {
	return new Promise( async function( resolve , reject ) {
		try {
			FFManager = new FirefoxWrapper();
			await FFManager.launch();
			await FFManager.openNewTab( "http://localhost:6969/youtube" );
			FFManager.x.fullScreen();
			FFManager.x.centerMouse();
			await FFManager.sleep( 6000 );
			FFManager.x.leftClick()
			await FFManager.sleep( 500 );
			FFManager.x.pressKeyboardKey( "f" );			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.youtube = YOUTUBE;