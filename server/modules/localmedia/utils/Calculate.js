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
			//console.log( "calculate().next()" );
			//console.log( current );

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
			}
			let episode_passive_data = Redis.hashGetAll( episode_key[ 0 ] );

			//let episode_passive_data = await GET_PASSIVE_EPISODE_DATA( current.genre , current.show , current.season_index , next_episode_index );

			// // Else , Calculate Next Episode In Season
			// await Redis.increment( current.episode_index_key );
			// let next_episode_index = await GET_EPISODE_INDEX( current.genre , current.show , current.season_index );

			// let episode_passive_data = await GET_PASSIVE_EPISODE_DATA( current.genre , current.show , current.season_index , next_episode_index );
			// let episode = episode_passive_data[ 0 ];
			// if ( episode ) { episode.episode_passive_key = episode_passive_data[ 1 ]; }
			// if ( !episode ) { // We Advanced Outside of Current Season's Range

			// 	// Advance Season
			// 	await Redis.increment( current.season_index_key );
			// 	let next_season_index = await GET_SEASON_INDEX( current.genre , current.show );
				
			// 	episode_passive_data = await GET_PASSIVE_EPISODE_DATA( current.genre , current.show , next_season_index , 0 );
			// 	episode = episode_passive_data[ 0 ];
			// 	if ( episode ) { episode.episode_passive_key = episode_passive_data[ 1 ]; }
			// 	if ( !episode ) { // We Advanced Oustside of Current Show's Season Range

			// 		if ( wOptions.advance_show ) { // Advnaced Show Index to Next Show in Genre

			// 		}
			// 		else { // Reset to First Season in Genre
			// 			episode_passive_data = await GET_PASSIVE_EPISODE_DATA( current.genre , current.show , 0 , 0 );
			// 			episode = episode_passive_data[ 0 ];
			// 			episode.episode_passive_key = episode_passive_data[ 1 ];						
			// 		}

			// 	}

			// }
			// // console.log( episode );
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
			//console.log( "calculate().previous()" );
			//console.log( current );

			// If Not Completed
			//if ( current.completed === false || current.completed === "false" ) { resolve( current ); return; }

			// Else , Calculate Next Episode In Season
			await Redis.decrement( current.episode_index_key );
			let previous_episode_index = await GET_EPISODE_INDEX( current.genre , current.show , current.season_index );

			let episode_passive_data = await GET_PASSIVE_EPISODE_DATA( current.genre , current.show , current.season_index , previous_episode_index );
			let episode = episode_passive_data[ 0 ];
			if ( episode ) { episode.episode_passive_key = episode_passive_data[ 1 ]; }
			if ( !episode ) { // We Advanced Outside of Current Season's Range

				// Get Previous Season
				await Redis.decrement( current.season_index_key );
				let previous_season_index = await GET_SEASON_INDEX( current.genre , current.show );
				if ( parseInt( previous_episode_index ) < 0 ) {
					let total_seasons_in_show_key = "LOCAL_MEDIA.GENRES." + current.genre + ".SHOWS." + current.show + ".TOTAL_SEASONS"
					let total_seasons_in_show = await Redis.keyGet( total_seasons_in_show_key );
					previous_season_index = ( parseInt( total_seasons_in_show ) - 1 );
				}
				// "LOCAL_MEDIA.GENRES.tvshows.SHOWS.iCarly.SEASON.5.TOTAL_EPISODES"
				// LOCAL_MEDIA.GENRES.tvshows.SHOWS.DrakeAndJosh.SEASON.0.TOTAL_EPISODES
				let previous_season_total_episodes_key = "LOCAL_MEDIA.GENRES." + current.genre + ".SHOWS." + current.show + ".SEASON." + ( parseInt( previous_season_index ) + 1 ).toString() + ".TOTAL_EPISODES";
				console.log( previous_season_total_episodes_key );
				let previous_season_total_episodes = await Redis.keyGet( previous_season_total_episodes_key );
				console.log( previous_season_total_episodes );
				episode_passive_data = await GET_PASSIVE_EPISODE_DATA( current.genre , current.show , previous_season_index , ( parseInt( previous_season_total_episodes ) - 1 ) );
				episode = episode_passive_data[ 0 ];
				if ( episode ) { episode.episode_passive_key = episode_passive_data[ 1 ]; }
				if ( !episode ) { // We Advanced Oustside of Current Show's Season Range

					if ( wOptions.advance_show ) { // Advnaced Show Index to Next Show in Genre

					}
					else { // Reset to First Season in Genre
						
						let total_seasons_in_show_key = "LOCAL_MEDIA.GENRES." + current.genre + ".SHOWS." + current.show + ".TOTAL_SEASONS"
						let total_seasons_in_show = await Redis.keyGet( total_seasons_in_show_key );

						let total_episodes_in_last_season_key = "LOCAL_MEDIA.GENRES." + current.genre + ".SHOWS." + current.show + ".SEASON." + total_seasons_in_show.toString() + ".TOTAL_EPISODES";
						let total_episodes_in_last_season = await Redis.keyGet( total_episodes_in_last_season_key );

						episode_passive_data = await GET_PASSIVE_EPISODE_DATA( current.genre , current.show , ( parseInt( total_seasons_in_show ) - 1 ) , ( parseInt( total_episodes_in_last_season ) - 1 ) );
						episode = episode_passive_data[ 0 ];
						episode.episode_passive_key = episode_passive_data[ 1 ];						
					}

				}

			}
			// console.log( episode );
			episode.current_time = 0;
			resolve( episode );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.previous = PREVIOUS;