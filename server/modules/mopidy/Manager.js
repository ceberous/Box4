const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.MOPIDY;

const wEmitter = require( path.join( MainFP , "main.js" ) ).emitter;
const Sleep = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).sleep;

const Mopidy = require( "mopidy" );
const Utils_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "Utils.js" );
const TracklistManger_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "Tracklist.js" );
const PlaybackManger_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "Playback.js" );
const LibrarytManger_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "Library.js" );
const RestartContinousPlay_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "RestartContinuousPlay.js" );

let INITIALIZE_RESOLVE;

// Needed Fixes

// 1.) Change File --> /usr/local/lib/python2.7/dist-packages/gmusicapi/clients/mobileclient.py
// --> @ Line Number 143
// 		self.android_id = self._validate_device_id(device_id, is_mac=is_mac)
// --> TO:
// 		self.android_id = "VALID_DEVICE_ID"

// 2.) https://github.com/mopidy/mopidy-spotify/issues/182#issuecomment-410507059

// https://github.com/martijnboland/moped

// https://github.com/mopidy/mopidy-youtube

// http://localhost:6690/moped/#/

var mopidy = null;
Mopidy.prototype._handleWebSocketError = async function ( error ) {
	Reporter.log( "WebSocket ERROR" );
	Reporter.log( "Binary not Running ???" );
	this._cleanup();
	this.close();
	mopidy.off();
	mopidy = null;
	await Redis.keySet( "STATUS.MOPIDY" , "OFFLINE" );
	return;
};
function tryToConnectMopidy( wPort ) {
	try {
		mopidy = new Mopidy({
			webSocketUrl: "ws://localhost:" + wPort.toString() + "/mopidy/ws/" ,
			autoConnect: true ,
			callingConvention: "by-position-or-by-name"
		});

	} catch( error ) { Reporter.log( "ERROR --> Mopdiy Binary not Running !" ); }
}

tryToConnectMopidy( 6690 );
mopidy.on( "state:online" , GLOBAL_INITIALIZE );
module.exports.mopidy = mopidy;

var LAST_EVENT_TIME = 0;
const EVENT_TIME_EASEMENT = 5000;
const R_LAST_SS_BASE = "LAST_SS.MOPIDY.";
const R_CONTINUOUS_PLAY = R_LAST_SS_BASE + "CONTINUOUS_PLAY";
mopidy.on( "event:trackPlaybackEnded" , async function ( wEvent ) {
	Reporter.log( "PLAYBACK --> ENDED" );
	await Sleep( 1000 );
	const time_now = new Date().getTime();
	const wDiff = ( time_now - LAST_EVENT_TIME );
	if ( wDiff < EVENT_TIME_EASEMENT ) {
		LAST_EVENT_TIME = time_now;
		await Sleep( EVENT_TIME_EASEMENT );
	}
	else {
		var wCTIDX = await require( PlaybackManger_FP ).getCurrentTrackIndex();
		console.log( "PLAYBACK --> CURRENT_INDEX --> " + wCTIDX );
		if ( wCTIDX === null ) {
			var still_live = await Redis.keyGet( PlaybackManger_FP );
			if ( still_live !== null && still_live !== "STOPPED" ) {
				await require( RestartContinousPlay_FP ).restart();
			}
		}
		LAST_EVENT_TIME = time_now;
	}
});

const R_NOW_PLAYING = R_LAST_SS_BASE + "NOW_PLAYING";
mopidy.on( "event:trackPlaybackStarted" , async function ( wEvent ) {
	await Sleep( 1000 );
	var wCT = await require( PlaybackManger_FP ).getCurrentTrack();
	if ( wCT === null ) { return; }
	await Redis.keySet( R_NOW_PLAYING , JSON.stringify( wCT ) );
	console.log("");
	Reporter.log( "PLAYBACK --> STARTED || CURRENT-TRACK --> " );
	Reporter.log( "Title = " + wCT[ "name" ] );
	Reporter.log( "Artist = " + wCT[ "artists" ][0].name );
});

mopidy.on( "event:playbackStateChanged" , async function ( wEvent ) {
	await Sleep( 3000 );
	await Redis.keySet( RC.STATE , wEvent.new_state.toUpperCase() );
	Reporter.log( "PLAYBACK --> CHANGED --> " );
	console.log( wEvent );
});

function GLOBAL_SHUTDOWN() {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( mopidy ) {
				try { await mopidy.playback.stop(); }
				catch(e) {}
				tryIgnoreError( mopidy.close );
				tryIgnoreError( mopidy.off );
			}
			mopidy = null;
			await Redis.keySet( RC.STATUS , "OFFLINE" );
			await Redis.keySet( RC.STATE , "STOPPED" );
			Reporter.log( "CLOSED" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.shutdown = GLOBAL_SHUTDOWN;


function GLOBAL_INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( LibrarytManger_FP ).initialize();
			await require( PlaybackManger_FP ).initialize();
			await require( TracklistManger_FP ).initialize();
			Reporter.log( "CONNECTED !!!" );
			await Redis.keySet( RC.STATUS , "ONLINE" );
			INITIALIZE_RESOLVE();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			INITIALIZE_RESOLVE = resolve;
			//resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.initialize = INITIALIZE;

// process.on( "SIGINT" , async function () {
// 	Reporter.log( "Shutting Down" );
// 	await GLOBAL_SHUTDOWN();
// 	// await Sleep( 1000 );
// 	// process.exit(1);
// });