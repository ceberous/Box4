const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.LOCAL_MEDIA;

const GetLiveConfig = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "Generic.js" ) ).getLiveConfig;
const GetCurrentShowInGenre = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "Generic.js" ) ).getCurrentShowInGenre;
const UpdateDuration = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "Generic.js" ) ).updateDuration;
//const GetLastPlayedInGenre = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "Generic.js" ) ).getLastPlayedInGenre;
//const GetLastPlayedGlobal = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "Generic.js" ) ).getLastPlayedGlobal;


function NEXT( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			wOptions = wOptions || await GetLiveConfig();
			let current_show = await GetCurrentShowInGenre( wOptions.genre );
			let next_episode_hash_key = await Redis.nextInCircularList( "LOCAL_MEDIA.GENRES." + wOptions.genre + ".SHOWS." + current_show + ".EPISODE_LIST" );
			if ( next_episode_hash_key[ 2 ] ) { // We got Recylced , go to Next Show ?

			}
			let next_episode = await Redis.hashGetAll( next_episode_hash_key[ 0 ] );
			if ( !next_episode ) { resolve( "Failed" ); return; }

			// On the fly duration , because it takes way too long to do all at once
			if ( parseInt( next_episode.duration ) <=3 ) { next_episode = await UpdateDuration( next_episode ); }
			resolve( next_episode );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.next = NEXT;


function PREVIOUS( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			wOptions = wOptions || await GetLiveConfig();
			let current_show = await GetCurrentShowInGenre( wOptions.genre );
			let previous_episode_hash_key = await Redis.previousInCircularList( "LOCAL_MEDIA.GENRES." + wOptions.genre + ".SHOWS." + current_show + ".EPISODE_LIST" );
			if ( previous_episode_hash_key[ 2 ] ) { // We got Recylced , go to Previous Show ?

			}
			let previous_episode = await Redis.hashGetAll( previous_episode_hash_key[ 0 ] );
			if ( !previous_episode ) { resolve( "Failed" ); return; }
			// On the fly duration , because it takes way too long to do all at once
			if ( parseInt( previous_episode.duration ) <=3 ) { previous_episode = await UpdateDuration( previous_episode ); }
			resolve( previous_episode );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.previous = PREVIOUS;