const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.TWITCH;
const Personal = require( path.join( MainFP , "main.js" ) ).personal.twitch;

const API = require( path.join( MainFP , "server" , "modules" , "twitch" , "API.js" ) );

function RESET_LIVE_SCORES( live_followers ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !live_followers ) { resolve(); return; }
			if ( live_followers.length < 1 ) { resolve(); return; }
			await Redis.keyDel( RC.LIVE_USERS );
			let multi = [];
			for ( let i = 0; i < Personal.followers.length; ++i ) {
				if ( live_followers.indexOf( Personal.followers[ i ] ) !== -1 ) {
					//multi.push( [ "zadd" , RC.LIVE_USERS , ( i + 1 ) , Personal.followers[ i ] ] );
					multi.push( [ "rpush" , RC.LIVE_USERS , Personal.followers[ i ] ] );
				}
			}
			multi.push( [ "del" , RC.LIVE_USERS_INDEX ] );
			await Redis.keySetMulti( multi );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function UPDATE_LIVE_FOLLOWERS_CACHE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await Redis.keyDel( RC.LIVE_USERS );
			let live_followers = await API.getLiveFollowers();
			console.log( live_followers );
			await RESET_LIVE_SCORES( live_followers );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.updateLiveFollowersCache = UPDATE_LIVE_FOLLOWERS_CACHE;


function IS_CURRENT_WATCHING_STILL_LIVE() {
	return new Promise( async function( resolve , reject ) {
		try {
			let answer = false;
			let current_watching = await Redis.keyGet( RC.CURRENT_LIVE_WATCHING_USER );
			if ( !current_watching ) { resolve( answer ); return; }
			let current_live = await API.getLiveFollowers();
			if ( !current_live ) { resolve( answer ); return; }
			if ( !current_live.length < 1 ) { resolve( answer ); return; }
			if ( current_live.indexOf( current_watching ) !== -1 ) {
				answer = true;
			}
			if ( !answer ) {
				await RESET_LIVE_SCORES( current_live );
			}
			resolve( answer );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.isCurrentWatchingStillLive = IS_CURRENT_WATCHING_STILL_LIVE;

// function VALIDATE_LIVE_FOLLOWERS_CACHE() {
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			let cache = await Redis.listGetFull( RC.LIVE_USERS );
// 			let current = await getLiveFollowers();
// 			resolve();
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }