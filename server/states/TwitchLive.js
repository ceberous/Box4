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
			let current_live;
			if ( wOptions ) {
				if ( wOptions.user ) { current_live = wOptions.user }
			}
			if ( !current_live ) {
				await UpdateLiveFollowersCache();
				current_live = await Redis.redis.zpopmin( RC.LIVE_USERS );
			}
			if ( !current_live ) { resolve(); return; }
			if ( current_live.length < 1 ) { resolve(); return; }
			Reporter.log( "Starting twitch.tv/ " + current_live );
			//await FFManager.twitch( current_live[ 0 ] );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( function( resolve , reject ) {
		try {
			//FFManager.raw.x.pressKeyboardKey( "space" );
			//FFManager.call( "x" , "pressKeyboardKey" , "space" );
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
			let next_user = Redis.nextInCircularList( RC.LIVE_USERS );
			if ( next_user ) { next_user = { user: next_user[ 0 ] }; }
			await Redis.keySet( RC.CURRENT_LIVE_WATCHING_USER , next_user[ 0 ] );
			await wStart( next_user );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			await Redis.decrement( RC.LIVE_USERS_INDEX );
			let index = Redis.keyGet( RC.LIVE_USERS_INDEX );
			let next_user = Redis.listGetByIndex( RC.LIVE_USERS , index );
			if ( next_user ) { next_user = { user: next_user }; }
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