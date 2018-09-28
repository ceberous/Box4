const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.LOCAL_MEDIA;

const wEmitter		= require( path.join( MainFP , "main.js" ) ).emitter;
const Sleep = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).sleep;
const UpdateLastPlayedTime = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "Generic.js" ) ).updateLastPlayedTime;

const MPLAYER_MAN = require( path.join( MainFP , "server" , "modules" , "mplayer" , "Manager.js" ) );
const ReinitializeMountPoint = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "HardDrive.js" ) ).reinitializeMountPoint;
const Calculate = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "Calculate.js" ) );

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			// 1.) Load Mount Point
			const GLOBAL_INSTANCE_MOUNT_POINT = await ReinitializeMountPoint();
			if ( !GLOBAL_INSTANCE_MOUNT_POINT ) { resolve( "no local media" ); return; }
			if ( GLOBAL_INSTANCE_MOUNT_POINT === "bad_mount_point" || GLOBAL_INSTANCE_MOUNT_POINT === "no_local_media" ) {
				await Redis.keySet( RC.STATUS , "OFFLINE" );
				resolve();
				return;
			}
			Reporter.log( "Live Mount Point === " + GLOBAL_INSTANCE_MOUNT_POINT );

			wEmitter.on( "MPlayerOVER" , async function( wResults ) {
				await UpdateLastPlayedTime( wResults );
				await Sleep( 1000 );
				// Continue if Config Says were Still Active
				const wAS = await Redis.keyGet( "LAST_SS.ACTIVE_STATE" );
				if ( wAS ) { 
					if ( wAS === "LOCAL_MEDIA" ) { PLAY(); }
					else { Reporter.log( "WE WERE TOLD TO QUIT" ); }
				}
				else { Reporter.log( "WE WERE TOLD TO QUIT" ); }
			});
			await Redis.keySet( RC.STATUS , "ONLINE" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;

function LOCAL_MPLAY_WRAP( wFilePath , wCurrentTime ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wFilePath ) { resolve(); return; }
			Reporter.log( "\nSTARTING --> MPLAYER" );
			await MPLAYER_MAN.playFilePath( wFilePath );
			if ( wCurrentTime ) {
				if ( wCurrentTime > 1 ) {
					await wSleep( 1000 );
					MPLAYER_MAN.seekSeconds( wCurrentTime );
				}
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function PLAY( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			Reporter.log( "play()" );
			const FinalNowPlaying = await Calculate.next( wOptions );
			await LOCAL_MPLAY_WRAP( FinalNowPlaying.fp , FinalNowPlaying.cur_time );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.play = PLAY;

function PAUSE( wOptions ) {
	return new Promise( function( resolve , reject ) {
		try {
			Reporter.log( "pause()" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.pause = PAUSE;

function RESUME( wOptions ) {
	return new Promise( function( resolve , reject ) {
		try {
			Reporter.log( "resume()" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.resume = RESUME;

function STOP( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			Reporter.log( "stop()" );
			const cur_time = MPLAYER_MAN.silentStop();
			await UpdateLastPlayedTime( cur_time );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.stop = STOP;

function NEXT( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			Reporter.log( "next()" );
			await STOP();
			await Calculate.skip();
			await PLAY();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.next = NEXT;

function PREVIOUS( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			Reporter.log( "previous()" );
			await STOP();
			const previous = await Calculate.previous();
			await LOCAL_MPLAY_WRAP( previous.fp , previous.cur_time );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.previous	= PREVIOUS;

function SHUTDOWN_ALL() {
	return new Promise( async function( resolve , reject ) {
		try {
			await STOP();
			await Sleep( 3000 );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.shutdown = SHUTDOWN_ALL;