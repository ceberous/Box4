const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.MOPIDY;

const mopidy = require( path.join( MainFP , "server" , "modules" , "mopidy" , "Manager.js" ) ).mopidy;
const Sleep = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).sleep;

function STOP() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.stop().then( async function ( something ) {
				await Redis.keySet( RC.STATE , "STOPPED" );
				resolve("success");
			});
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function PLAY() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.play().then( async function ( something ) {
				await Redis.keySet( RC.STATE , "PLAYING" );
				resolve("success");
			});
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function PAUSE() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.getState().then( async function ( state ) {
				if ( state === "paused" ) {
					await RESUME();
				}
				else {
					mopidy.playback.pause().then( async function ( something ) {
						await Redis.keySet( RC.STATE , "PAUSED" );
						resolve("success");
					});
				}
			});
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function RESUME() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.resume().then( async function ( something ) {
				await Redis.keySet( RC.STATE , "PLAYING" );
				resolve("success");
			});
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function NEXT() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.next().then( function ( something ) {
				resolve("success");
			});
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function PREVIOUS() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.previous().then( function ( something ) {
				resolve("success");
			});
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function GET_CURRENT_TRACK_INDEX() {
	return new Promise( function( resolve , reject ) {
		try { mopidy.tracklist.index( {} ).then( function( data ) { resolve( data ); }).catch( function( wERR ) { /*Reporter.log( error );*/ } ); }
		catch( error ) { /*Reporter.log( error );*/ /* reject( error ); */ }
	});
}

function GET_CURRENT_TRACK() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.getCurrentTrack()
			.then( function ( wTrack ) { resolve( wTrack ); } )
			.catch( function( wERR ) { reject( wERR ); } );
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function GET_STATE() {
	return new Promise( function( resolve , reject ) {
		try {
			mopidy.playback.getState().then( async function ( state ) {
				if ( !state ) { state = "UNKNOWN"; }
				if ( state.length < 3 ) { state = "UNKNOWN"; }
				else { state = state.toUpperCase(); }
				Reporter.log( "STATE = " + state );
				await Redis.keySet( RC.STATE , state );
				resolve( state );
			});
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await Sleep( 1000 );
			Reporter.log( await GET_STATE() );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;
module.exports.getState = GET_STATE;
module.exports.play = PLAY;
module.exports.getCurrentTrackIndex = GET_CURRENT_TRACK_INDEX;
module.exports.getCurrentTrack = GET_CURRENT_TRACK;
module.exports.previous = PREVIOUS;
module.exports.next = NEXT;
module.exports.pause = PAUSE;
module.exports.resume = RESUME;
module.exports.stop = STOP;