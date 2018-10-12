const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const Personal = require( path.join( MainFP , "main.js" ) ).personal.mopidy;
const RC = Redis.c.MOPIDY;

const Utils_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "Utils.js" );
const TracklistManger_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "Tracklist.js" );
const PlaybackManger = require( path.join( MainFP , "server" , "modules" , "mopidy" , "Playback.js" ) );
const LibrarytManger_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "Library.js" );
const RestartContinousPlay_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "RestartContinuousPlay.js" );

function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			await Redis.keySet( RC.CONTINUOUS_GENRE , "relaxing" );
			await require( RestartContinousPlay_FP ).restart();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

// function wPause() {
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			await require( PlaybackManger_FP ).pause();
// 			resolve();
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }

// function wResume() {
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			await require( PlaybackManger_FP ).resume();
// 			resolve();
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await Redis.keySet( RC.CONTINUOUS_GENRE , "STOPPED" );
			await PlaybackManger.stop();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

// function wNext() {
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			await require( PlaybackManger_FP ).next();
// 			resolve();
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }

// function wPrevious() {
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			await require( PlaybackManger_FP ).previous();
// 			resolve();
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }

module.exports.start = wStart;
module.exports.pause = PlaybackManger.pause;
module.exports.resume = PlaybackManger.resume;
module.exports.stop = wStop;
module.exports.next = PlaybackManger.next;
module.exports.previous = PlaybackManger.previous;