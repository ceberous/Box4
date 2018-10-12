const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.YOUTUBE;
const wEmitter = require( path.join( MainFP , "main.js" ) ).emitter;
const SetStagedFFClientTask = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).setStagedFFClientTask;
const Live_FP = path.join( MainFP , "server" , "modules" , "youtube" , "Live.js" );
let FFManager = require( path.join( MainFP , "server" , "modules" , "firefox" , "Firefox.js" ) );

function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			//await require( "../youtubeManager.js" ).updateStandard();
			let live_videos = await require( Live_FP ).getLiveVideos();
			if ( !live_videos ) { resolve( "No Live Videos" ); return; }
			await SetStagedFFClientTask( { message: "Youtube" , playlist: live_videos  } );
			await FFManager.youtube();
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