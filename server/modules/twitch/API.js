//https://dev.twitch.tv/docs/v5/reference/users#follow-channel

const request = require( "request" );
const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.TWITCH;
const wTwitchKeys = require( path.join( MainFP , "main.js" ) ).personal.twitch;

function followUserName( wUserNameToFollow  ) {
	return new Promise( function( resolve , reject ) {
		try {
			const FOLLOW_USER_URL = "https://api.twitch.tv/kraken/users/" + wTwitchKeys.user_name + "/follows/channels/" + wUserNameToFollow +"?client_id=" + wTwitchKeys.client_id + "&oauth_token=" + wTwitchKeys.oauth_token + "&on_site=1";
			request.put( FOLLOW_USER_URL , function ( err , response , body ) {
				if ( err ) { Reporter.log( err ); reject( err ); return; }
				resolve( JSON.parse( body ) );
			});
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
module.exports.followUserName = followUserName;

function unfollowUserName( wUserNameToUnFollow ) {
	return new Promise( function( resolve , reject ) {
		try {
			const UN_FOLLOW_USER_URL = "https://api.twitch.tv/kraken/users/" + wTwitchKeys.user_name + "/follows/channels/" + wUserNameToUnFollow +"?client_id=" + wTwitchKeys.client_id + "&oauth_token=" + wTwitchKeys.oauth_token + "&on_site=1";
			request.delete( UN_FOLLOW_USER_URL , function ( err , response , body ) {
				if ( err ) { Reporter.log( err ); reject( err ); return; }
				let x11 = null;
				try { x11 = JSON.parse( body ); }
				catch( err ) { x11 = ""; }
				resolve( x11 );
			});
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
module.exports.unfollowUserName = unfollowUserName;

const GET_FOLLOWERS_URL = "https://api.twitch.tv/kraken/users/" + wTwitchKeys.user_name + "/follows/channels?client_id=" + wTwitchKeys.client_id + "&oauth_token=" + wTwitchKeys.oauth_token + "&on_site=1&limit=100";
function getFollowers() {
	return new Promise( function( resolve , reject ) {
		try {
			request( GET_FOLLOWERS_URL , async function ( err , response , body ) {
				if ( err ) {
					Reporter.log( err );
					reject( err );
					return;
				}
				let followers = JSON.parse( body );
				followers = followers[ "follows" ];
				followers = followers.map( x => x[ "channel" ][ "name" ] );
				resolve( followers );
			});
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
module.exports.getFollowers = getFollowers;

const LIVE_FOLLOWERS_URL = "https://api.twitch.tv/kraken/streams/followed?client_id=" + wTwitchKeys.client_id + "&oauth_token=" + wTwitchKeys.oauth_token + "&on_site=1";
function getLiveFollowers() {
	return new Promise( async function( resolve , reject ) {
		try {
			let final_results = [];
			request( LIVE_FOLLOWERS_URL , async function ( err , response , body ) {
				if ( err ) { Reporter.log( err ); resolve( err ); return; }
				xR = JSON.parse( body );
				if ( xR[ "error" ] ) { if ( xR[ "error"] === "Bad Request" ) { Reporter.log( xR ); resolve( xR ); } }
				xR = xR[ "streams" ];
				final_results = xR.filter( x => x[ "stream_type" ] === "live" );
				//console.log( final_results );
				final_results = final_results.map( x => x.channel.name );
				resolve( final_results );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getLiveFollowers = getLiveFollowers;