const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.TWITCH;
const wEmitter = require( path.join( MainFP , "main.js" ) ).emitter;
const SetStagedFFClientTask = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).setStagedFFClientTask;
const UpdateLiveFollowersCache = require( path.join( MainFP , "server" , "modules" , "twitch" , "Utils.js" ) ).updateLiveFollowersCache;
let FFManager = require( path.join( MainFP , "server" , "modules" , "firefox" , "Firefox.js" ) );

function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let first_user;
			if ( wOptions ) {
				if ( wOptions.user ) { first_user = wOptions.user }
			}
			if ( !first_user ) {
				await UpdateLiveFollowersCache();
				first_user = await Redis.nextInCircularList( RC.LIVE_USERS );
				if ( first_user ) { first_user = first_user[ 0 ]; }
			}
			if ( !first_user ) { resolve(); return; }
			if ( first_user.length < 1 ) { resolve(); return; }
			Reporter.log( "Starting https://twitch.tv/" + first_user );
			await Redis.keySet( RC.CURRENT_LIVE_WATCHING_USER , first_user );
			await FFManager.twitch( first_user );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( function( resolve , reject ) {
		try {
			FFManager.twitchPause();
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
			let next_user = await Redis.nextInCircularList( RC.LIVE_USERS );
			if ( next_user ) { next_user = { user: next_user[ 0 ] }; }
			await wStart( next_user );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			let next_user = await Redis.previousInCircularList( RC.LIVE_USERS );
			if ( next_user ) { next_user = { user: next_user[ 0 ] }; }
			await wStart( next_user );
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