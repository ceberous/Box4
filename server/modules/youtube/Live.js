const request = require( "request" );
const cheerio = require("cheerio");
const { map } = require( "p-iteration" );

const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.YOUTUBE.LIVE;

function GET_LIVE_VIDEOS() {
	let current_followers = [];
	let current_blacklist = [];
	function searchFollower( wChannelID ) {
		return new Promise( function( resolve , reject ) {
			try {
				let wURL = null;
				if ( wChannelID.substring( 0 , 2 ) === "UC" ) { wURL = "https://www.youtube.com/channel/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
				else { wURL = "https://www.youtube.com/user/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
				Reporter.log( wURL );

				let wResults = [];
				request( wURL , function ( err , response , body ) {
					if ( err ) { console.log( err ); reject( err ); return; }
					try { let $ = cheerio.load( body ); }
					catch(err) { reject( "cheerio load failed" ); return; }
					$( ".yt-lockup-title > a" ).each( function () {
						let wID = $( this ).attr( "href" );
						wID = wID.substring( wID.length - 11 , wID.length );
						//wResults.push( { title: $( this ).text() , id: wID } );
						wResults.push( wID );
					});
					resolve( wResults );
				});

			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	}
	return new Promise( async function( resolve , reject ) {
		try {
			await Redis.delKey( RC.LATEST );

			current_followers = await Redis.setGetFull( RC.FOLLOWERS );
			current_blacklist = await Redis.setGetFull( RC.BLACKLIST );

			let live_videos = await map( current_followers , userId => searchFollower( userId ) );

			live_videos = [].concat.apply( [] , live_videos );
			live_videos = live_videos.filter( function( val ) { return current_blacklist.indexOf( val ) === -1; } );

			await Redis.setSetFromArray( RC.LATEST , live_videos );
			resolve( live_videos );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getLiveVideos = GET_LIVE_VIDEOS;


function GET_FOLLOWERS() {
	return new Promise( async function( resolve , reject ) {
		try {
			const followers = await Redis.setGetFull( RC.FOLLOWERS );
			resolve( followers );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getFollowers = GET_FOLLOWERS;

function ADD_FOLLOWER( wChannelID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await redis.sadd( RC.FOLLOWERS , wChannelID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.addFollower = ADD_FOLLOWER;

function REMOVE_FOLLOWER( wChannelID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await redis.srem( RC.FOLLOWERS , wChannelID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.removeFollower = REMOVE_FOLLOWER;

function GET_BLACKLIST() {
	return new Promise( async function( resolve , reject ) {
		try {
			const blacklist = await Redis.setGetFull( RC.BLACKLIST );
			resolve( blacklist );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getBlacklist = GET_BLACKLIST;

function BLACKLIST_VID( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await redis.sadd( RC.BLACKLIST , wVideoID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.blacklistVID = BLACKLIST_VID;

function REMOVE_BLACKLIST_VID( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await redis.srem( RC.BLACKLIST , wVideoID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.removeBlacklistVID = REMOVE_BLACKLIST_VID;