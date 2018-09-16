const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const path = require( "path" );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;


const RESETS =  [ "YOU_TUBE.LIVE.LATEST*"  /* , "YOU_TUBE.STANDARD.LATEST*" */ , "YOU_TUBE.NP_SESSION*" , "HARD_DRIVE.*" , "LOCAL_MEDIA.*" ];

var SET_KEYS = {
	"CONFIG.ARRIVED_HOME": "false" ,
	"MOPIDY.STATE": "stopped" ,
	"STAGED_FF_TASK": "null" ,
	"YOU_TUBE.ODYSSEY_PRELIM_TOTAL": 8 ,

	"STATUS.USB_BUTTONS": "OFFLINE" ,
	"STATUS.LOCAL_MEDIA": "OFFLINE" ,
	"STATUS.YT_LIVE": "OFFLINE" ,
	"STATUS.TY_STANDARD": "OFFLINE" ,
	"STATUS.TWITCH": "OFFLINE" ,
	"STATUS.SKYPE": "OFFLINE" ,
	"STATUS.MOPIDY": "OFFLINE" ,
	"STATUS.DISCORD": "OFFLINE" ,
};

const SET_IF_NOT_EXIST_KEYS = {
};

function SAVE_CONFIG_TO_REDIS() {
	return new Promise( async function( resolve , reject ) {
		try {
			// 0.) Bring in physical config
			const YT = require( path.join( MainFP , "main.js" ) ).config.youtube;
			SET_KEYS[ "YOU_TUBE.LIVE.FOLLOWERS" ] = YT.LIVE.FOLLOWERS.map( x => x[ "id" ] );
			SET_KEYS[ "YOU_TUBE.LIVE.BLACKLIST" ] = YT.LIVE.BLACKLIST;
			SET_KEYS[ "YOU_TUBE.STANDARD.FOLLOWERS" ] = YT.STANDARD.FOLLOWERS.map( x => x[ "id" ] );
			SET_KEYS[ "YOU_TUBE.STANDARD.BLACKLIST" ] = YT.STANDARD.BLACKLIST;
			const IST = require( path.join( MainFP , "main.js" ) ).config.instagram;
			SET_KEYS[ "INSTAGRAM.FOLLOWERS" ] = IST;

			const MEDIA_MOUNT_POINT = require( path.join( MainFP , "main.js" ) ).config.MEDIA_MOUNT_POINT;
			SET_KEYS[ "CONFIG.MEDIA_MOUNT_POINT" ] = JSON.stringify( MEDIA_MOUNT_POINT );

			const REDIS_CONFIG = require( path.join( MainFP , "main.js" ) ).config.redis;
			SET_KEYS[ "CONFIG.REDIS" ] = JSON.stringify( REDIS_CONFIG );

			// const DISCORD_CALLES = require( path.join( MainFP , "personal.js" ) ).discordCalles;
			// SET_KEYS[ "DISCORD.CALLE1" ] = DISCORD_CALLES[ 0 ];
			// SET_KEYS[ "DISCORD.CALLE2" ] = DISCORD_CALLES[ 1 ];

			// 1.) Reset Anything that should be fresh
			if ( RESETS ) {
				await Redis.deleteMultiplePatterns( RESETS );
			}
			
			var wMulti = [];
			
			// 2.) Initialize Status of Everything to Offline
			const StatusKeys = Redis.c.STATUS;
			for ( var i = 0; i < StatusKeys.length; ++i ) {
				wMulti.push( [ "set" , StatusKeys[ i ] , "OFFLINE" ] )
			}

			// 3.) Rebuild Skeloton-DB-Struct if 1st run , or somehow gone
			if ( SET_IF_NOT_EXIST_KEYS ) {
				for ( var wKey in SET_IF_NOT_EXIST_KEYS ) {
					wMulti.push( [ "setnx" , wKey , SET_IF_NOT_EXIST_KEYS[ wKey ] ] );
				}
			}

			// 4.) Load "run-time" Config
			if ( SET_KEYS ) {
				for ( var wKey in SET_KEYS ) {
					if ( Array.isArray( SET_KEYS[ wKey ] ) ) {
						for ( var i = 0; i < SET_KEYS[ wKey ].length; ++i ) {
							wMulti.push( [ "sadd" , wKey , SET_KEYS[ wKey ][ i ] ] );
						}
					}
					else {
						wMulti.push( [ "set" , wKey , SET_KEYS[ wKey ] ] );
					}
				}
			}
			
			//console.log( wMulti );
			await Redis.keySetMulti( wMulti );

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.saveConfigToRedis = SAVE_CONFIG_TO_REDIS;