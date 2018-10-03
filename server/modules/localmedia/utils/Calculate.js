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
	return "LOCAL_MEDIA.GENRES." + wGenre + ".SHOWS." + wShowName + ".SEASONS.INDEX";
}
function GET_SEASON_INDEX( wGenre , wShowName ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let key = GET_SEASON_INDEX_KEY( wGenre , wShowName );
			Reporter.log( "getSeasonIndex() --> " + key );
			let season_index = await Redis.keyGet( key );
			resolve( [ season_index , key ] );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function GET_EPISODE_INDEX_KEY( wGenre , wShowName , wSeasonIndex ) {
	return "LOCAL_MEDIA.GENRES." + wGenre + ".SHOWS." + wShowName + ".SEASONS." + wSeasonIndex.toString() + ".EPISODES.INDEX";
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
function GET_PASSIVE_EPISODE_DATA_KEY( wGenre , wShowName , wSeasonIndex , wEpisodeIndex ) {
	return RC.PASSIVE.BASE + "GENRES." + wGenre + ".SHOWS." + wShowName + ".SEASONS." + wSeasonIndex.toString() + ".EPISODES." + wEpisodeIndex.toString();
}
function GET_PASSIVE_EPISODE_DATA( wGenre , wShowName , wSeasonIndex , wEpisodeIndex ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wGenre ) { resolve( [ undefined  ,undefined ] ); return; }
			if ( !wShowName ) { resolve( [ undefined  ,undefined ] ); return; }
			if ( !wSeasonIndex ) { resolve( [ undefined  ,undefined ] ); return; }
			if ( !wEpisodeIndex ) { resolve( [ undefined  ,undefined ] ); return; }
			let key = GET_PASSIVE_EPISODE_DATA_KEY( wGenre , wShowName , wSeasonIndex , wEpisodeIndex );
			console.log( key );
			Reporter.log( "getPassiveEpisodeData( " +  wGenre + " , " + wShowName + " , " + wSeasonIndex.toString() + " , " + wEpisodeIndex.toString() + " )" );
			let episode = await Redis.hashGetAll( key );
			resolve( [ episode , key ] );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function GET_CURRENT_IN_GENRE( wGenre ) {
	return new Promise( async function( resolve , reject ) {
		try {
			Reporter.log( "getCurrentInGenre( " + wGenre + " )" );

			// Show Index
			let show_index_key = "LOCAL_MEDIA.GENRES." + wGenre + ".SHOWS.INDEX";
			let show_index = await Redis.keyGet( show_index_key );
			console.log( "Current Show Index = " + show_index.toString() );
			
			// Show Key
			let show_key = "LOCAL_MEDIA.GENRES." + wGenre + ".SHOWS";
			let show_name = await Redis.listGetByIndex( show_key , show_index );
			console.log( "Current Show = " + show_name );
			
			// Season Index
			let season_data = await GET_SEASON_INDEX( wGenre , show_name );
			let season_index = season_data[ 0 ];
			let season_index_key = season_data[ 1 ];
			console.log( "Current Season Index = " + season_index.toString() );

			// Episode Index
			let episode_data =  await GET_EPISODE_INDEX( wGenre , show_name , season_index );
			let episode_index = episode_data[ 0 ];
			let episode_index_key = episode_data[ 1 ];
			console.log( "Current Episode Index = " + episode_index.toString() );
			
			// Episode
			let episode_passive_data = await GET_PASSIVE_EPISODE_DATA( wGenre , show_name , season_index , episode_index );
			let episode = episode_passive_data[ 0 ];
			let episode_passive_key = episode_passive_data[ 1 ];

			// episode.season_index_key = season_index_key;
			// episode.episode_index_key = episode_index_key;
			// episode.episode_passive_key = episode_passive_key;

			resolve( episode );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function NEXT( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			
			wOptions = wOptions || await GetLiveConfig();

			// Get Current
			let current = await GET_CURRENT_IN_GENRE( wOptions.genre );
			if ( !current ) { resolve( "Failed" ); return; }
			if ( parseInt( current.duration ) === 0 ) {
				current.duration = current.remaining_time = await GetDuration( current.fp );
				current.three_percent = Math.floor( ( current.duration - ( current.duration * 0.025 ) ) );
			}

			// If Not Completed
			if ( current.skipped === false || current.skipped === "false" ) {
				if ( current.completed === false || current.completed === "false" ) {
					resolve( current );
					return;
				}
			}

			let episode_key = await Redis.nextInCircularList( "LOCAL_MEDIA.GENRES." + current.genre + ".SHOWS." + current.show + ".SEASONS." + current.season_index.toString() + ".EPISODES" );
			console.log( episode_key );
			// If We Got Reset By Circular List function , then we need to advance to next season
			if ( current.episode_index === episode_key[ 1 ] ) { 
				let next_season = await Redis.nextInCircularList( "LOCAL_MEDIA.GENRES." + current.genre + ".SHOWS." + current.show + ".SEASONS" );
				episode_key = await Redis.nextInCircularList( "LOCAL_MEDIA.GENRES." + current.genre + ".SHOWS." + current.show + ".SEASONS." + next_season.toString() + ".EPISODES" );
			}
			let episode_passive_data = Redis.hashGetAll( episode_key[ 0 ] );

			
			resolve( episode_passive_data );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.next = NEXT;


function PREVIOUS( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			
			wOptions = wOptions || await GetLiveConfig();

			// Get Current
			let current = await GET_CURRENT_IN_GENRE( wOptions.genre );
			if ( !current ) { resolve( "Failed" ); return; }
			if ( parseInt( current.duration ) === 0 ) {
				current.duration = current.remaining_time = await GetDuration( current.fp );
				current.three_percent = Math.floor( ( current.duration - ( current.duration * 0.025 ) ) );
			}

			console.log( current );

			let episode_key;
			let season_index;
			let episode_index;
			
			// If We Got Reset By Circular List function , then we need to Go to Previous season
			if ( parseInt( current.episode_index ) === 0 ) {
				console.log( "Need to Go To Previous Season" );
				
				season_index = await Redis.previousInCircularList( "LOCAL_MEDIA.GENRES." + current.genre + ".SHOWS." + current.show + ".SEASONS" );
				season_index = season_index[ 0 ];
				console.log( "Season Index Now === " + season_index.toString() );
				
				let total_episodes_in_season_key = "LOCAL_MEDIA.GENRES." + current.genre + ".SHOWS." + current.show + ".SEASONS." + season_index.toString() + ".EPISODES.TOTAL";
				//console.log( total_episodes_in_season_key );
				let total_episodes_in_season = await Redis.keyGet( total_episodes_in_season_key );
				console.log( "Total Episodes in Previous Season === " + total_episodes_in_season.toString() );
				episode_index = ( total_episodes_in_season - 1 );
				console.log( "Episode Index Now === " + episode_index.toString() );

				let key = "LOCAL_MEDIA.GENRES." + current.genre + ".SHOWS." + current.show + ".SEASONS." + season_index.toString() + ".EPISODES";
				console.log( key );
				await Redis.keySet( key + ".INDEX" , episode_index );
				episode_key = await Redis.listGetByIndex( key , episode_index );
				
			}
			else {
				console.log( "Safe to just get Previous in Season" );
				let key = "LOCAL_MEDIA.GENRES." + current.genre + ".SHOWS." + current.show + ".SEASONS." + current.season_index.toString() + ".EPISODES";
				console.log( key );
				episode_key = await Redis.previousInCircularList( key );
				episode_key = episode_key[ 0 ];
			}

			console.log( "Previous Calculated Key === " );
			console.log( episode_key );
			let episode_passive_data = Redis.hashGetAll( episode_key );
			resolve( episode_passive_data );

		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.previous = PREVIOUS;