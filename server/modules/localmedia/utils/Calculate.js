const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.LOCAL_MEDIA;

const GetLiveConfig = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "Generic.js" ) ).getLiveConfig;
const GetLastPlayedInGenre = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "Generic.js" ) ).getLastPlayedInGenre;
const GetLastPlayedGlobal = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "Generic.js" ) ).getLastPlayedGlobal;
const GetDuration = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).getDuration;

function GET_SEASON_INDEX_KEY( wGenre , wShowName ) {
	return "LOCAL_MEDIA.GENRES." + wGenre + "." + wShowName + ".CURRENT_INDEX";
}
function GET_SEASON_INDEX( wGenre , wShowName ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let key = GET_SEASON_INDEX_KEY( wGenre , wShowName );
			let season_index = await Redis.keyGet( key );
			resolve( [ season_index , key ] );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function GET_EPISODE_INDEX_KEY( wGenre , wShowName , wSeasonIndex ) {
	return "LOCAL_MEDIA.GENRES." + wGenre + ".SHOWS." + wShowName + ".SEASON." + ( parseInt( wSeasonIndex ) + 1 ).toString() + ".CURRENT_INDEX";
}
function GET_EPISODE_INDEX( wGenre , wShowName , wSeasonIndex ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let key = GET_EPISODE_INDEX_KEY( wGenre , wShowName , wSeasonIndex );
			let episode_index = await Redis.keyGet( key );
			resolve( [ episode_index , key ] );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}
function GET_PASSIVE_EPISODE_DATA( wGenre , wShowName , wSeasonIndex , wEpisodeIndex ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let key = RC.PASSIVE.BASE + "GENRES." + wGenre + ".SHOWS." + wShowName + ".SEASON." + ( parseInt( wSeasonIndex ) + 1 ).toString() + ".EPISODE." + ( parseInt( wEpisodeIndex ) + 1 ).toString();
			let episode = await Redis.hashGetAll( key );
			resolve( episode );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function GET_CURRENT_IN_GENRE( wGenre ) {
	return new Promise( async function( resolve , reject ) {
		try {
			// Show Index
			let show_index_key = "LOCAL_MEDIA.GENRES." + wGenre + ".CURRENT_INDEX";
			let show_index = await Redis.keyGet( show_index_key );
			//console.log( "Current Show Index = " + show_index.toString() );
			
			// Show Key
			let show_key = "LOCAL_MEDIA.GENRES." + wGenre + ".SHOWS";
			let show_name = await Redis.listGetByIndex( show_key , show_index );
			//console.log( "Current Show = " + show_name );
			
			// Season Index
			let season_data = await GET_SEASON_INDEX( wGenre , show_name );
			let season_index = season_data[ 0 ];
			let season_index_key = season_data[ 1 ];
			//console.log( "Current Season Index = " + season_index.toString() );

			// Episode Index
			let episode_data =  await GET_EPISODE_INDEX( wGenre , show_name , season_index );
			let episode_index = episode_data[ 0 ];
			let episode_index_key = episode_data[ 1 ];
			//console.log( "Current Episode Index = " + episode_index.toString() );
			
			// Episode
			let episode = await GET_PASSIVE_EPISODE_DATA( wGenre , show_name , season_index , episode_index );

			episode.season_index_key = season_index_key;
			episode.episode_index_key = episode_index_key;

			//console.log( episode );
			resolve( episode );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function NEXT( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			
			// Get Current
			let current = await GET_CURRENT_IN_GENRE( wOptions.genre );
			if ( !current ) { resolve( "Failed" ); return; }
			if ( parseInt( current.duration ) === 0 ) { current.duration = current.remaining_time = await GetDuration( current.fp ); }
			console.log( current );

			// If Not Completed
			if ( !current.completed ) { resolve( current ); return; }

			// Else , Calculate Next Episode In Season
			await Redis.increment( current.episode_index_key );
			let next_episode_index = await GET_EPISODE_INDEX( current.genre , current.show , current.season_index );

			let episode = await GET_PASSIVE_EPISODE_DATA( current.genre , current.show , current.season_index , next_episode_index );
			if ( !episode ) { // We Advanced Outside of Current Season's Range

				// Advance Season
				await Redis.increment( current.season_index_key );
				let next_season_index = await GET_SEASON_INDEX( current.genre , current.show );
				
				episode = await GET_PASSIVE_EPISODE_DATA( current.genre , current.show , next_season_index , 0 );
				if ( !episode ) { // We Advanced Oustside of Current Show's Season Range

					if ( wOptions.advance_show ) { // Advnaced Show Index to Next Show in Genre

					}
					else { // Reset to First Season in Genre
						episode = await GET_PASSIVE_EPISODE_DATA( current.genre , current.show , 0 , 0 );
					}

				}

			}
			// console.log( episode );
			resolve( episode );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.next = NEXT;