const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.YOUTUBE;
const wEmitter = require( path.join( MainFP , "main.js" ) ).emitter;
const SetStagedFFClientTask = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).setStagedFFClientTask;
let FFManager = require( path.join( MainFP , "server" , "modules" , "firefox" , "Firefox.js" ) );

function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wOptions ) { resolve( "No Video Info Provided" ); return; }
			if ( !wOptions.list ) { resolve( "No List Provided" ); return; }
			if ( wOptions.list.length < 1  ) { resolve( "No List Provided" ); return; }
			let list = wOptions.list.split( "," );
			await SetStagedFFClientTask( { message: "Youtube" , playlist: list  } );
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
			wEmitter.emit( "sendFFClientMessage" , "next" );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "previous" );
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