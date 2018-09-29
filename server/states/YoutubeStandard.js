const path = require( "path" );
const FirefoxWrapper = require( "firefox-wrapper" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.YOUTUBE;
const wEmitter = require( path.join( MainFP , "main.js" ) ).emitter;
const SetStagedFFClientTask = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).setStagedFFClientTask;

let FFManager;
function GET_NEXT_VIDEO() {
	return new Promise( async function( resolve , reject ) {
		try {
			let finalVideo = await Redis.setPopRandomMembers( RC.STANDARD.LATEST , 1 );
			if ( finalVideo.length < 1 ) { Reporter.log( "No Standard Videos Left" ); resolve(); return; }
			else { finalVideo = finalVideo[ 0 ]; }			
			Reporter.log( "Next Video = " + finalVideo );
			// WutFace https://stackoverflow.com/questions/17060672/ttl-for-a-set-member
			await Redis.keySetMulti( [ 
				[ "sadd" , RC.WATCHED , finalVideo ] ,
				[ "set" , RC.NOW_PLAYING_ID , finalVideo ] , 
			]);			
			resolve( finalVideo );
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			//await require( "../youtubeManager.js" ).updateStandard();
			let final_vid = await GET_NEXT_VIDEO();
			if ( !final_vid ) { resolve( "No Standard Videos Left" ); return; }
			await SetStagedFFClientTask( { message: "YTStandardForeground" , playlist: [ final_vid ]  } );
			FFManager = new FirefoxWrapper();
			await FFManager.launch();
			await FFManager.openNewTab( "http://localhost:6969/youtube" );
			FFManager.x.fullScreen();
			FFManager.x.centerMouse();
			await FFManager.sleep( 500 );
			FFManager.x.leftClick()
			await FFManager.sleep( 500 );
			FFManager.x.pressKeyboardKey( "f" );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "pause" );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await FFManager.close();
			FFManager = undefined;
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			let final_vid = await GET_NEXT_VIDEO();
			wEmitter.emit( "sendFFClientMessage" , "next" , final_vid );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wPrevious() { // ehhhh needs fixed
	return new Promise( async function( resolve , reject ) {
		try {
			let final_vid = await GET_NEXT_VIDEO();
			wEmitter.emit( "sendFFClientMessage" , "next" , final_vid );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;
module.exports.next = wNext;
module.exports.previous = wPrevious;