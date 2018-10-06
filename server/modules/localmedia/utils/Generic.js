const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const path = require( "path" );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.LOCAL_MEDIA;
const GetDuration = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).getDuration;

function ADVANCE_NEXT_SHOW_POSITION( wCurrentIndex ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let FinalUNEQ_IDX = ( wCurrentIndex + 1 );
			let R_NextShow = R_FinalBase + "META.UNEQ";
			let FinalShowName = await Redis.listGetByIndex( R_NextShow , FinalUNEQ_IDX );
			if ( FinalShowName === null ) { //  IF Advanced Past Total-UNEQ-aka-Unique Shows in Genre
				//console.log( "inside show-in-genre reset" );
				FinalUNEQ_IDX = 0;
				FinalShowName = await Redis.listGetByIndex( R_NextShow , FinalUNEQ_IDX );
			}
			const x1 = [ FinalUNEQ_IDX , FinalShowName ];
			//console.log( x1 );
			resolve( x1 );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.advanceNextShow = ADVANCE_NEXT_SHOW_POSITION;

function UPDATE_LAST_PLAYED_TIME( wTime , wSkipped ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wTime ) { resolve(); return; }
			let now_playing = await Redis.keyGetDeJSON( RC.NOW_PLAYING.global );
			if ( !now_playing ) { resolve(); return; }
			//console.log( "wTime === " + wTime.toString() );
			now_playing.current_time = wTime;
			now_playing.remaining_time = ( now_playing.duration - now_playing.current_time );
			// console.log( "UpdatingLastPlayedTime()" );
			// console.log( now_playing );
			await Redis.hashSetMulti( now_playing.passive_episode_key ,
				"current_time" , now_playing.current_time ,
				"remaining_time" , now_playing.remaining_time
			);
			if ( now_playing.current_time >= now_playing.three_percent ) {
				now_playing.completed = true;
				await Redis.hashSetMulti( now_playing.passive_episode_key , "completed" , true );
			}

			if ( wSkipped ) {
				now_playing.skipped = true;
				await Redis.hashSetMulti( now_playing.passive_episode_key , "skipped" , true );
			}

			//console.log( now_playing );
			const x1 = JSON.stringify( now_playing );
			await Redis.keySetMulti( [ [ "set" , RC.NOW_PLAYING[ now_playing.genre ] , x1 ] ,  [ "set" , RC.NOW_PLAYING.global , x1 ] ]);

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.updateLastPlayedTime = UPDATE_LAST_PLAYED_TIME;

function GET_LIVE_CONFIG() {
	return new Promise( async function( resolve , reject ) {
		try {
			let liveConfig = await Redis.keyGetMulti( RC.CONFIG.GENRE , RC.CONFIG.ADVANCE_SHOW , RC.CONFIG.SPECIFIC_SHOW , RC.CONFIG.SPECIFIC_EPISODE , RC.MOUNT_POINT );
			if ( liveConfig ) {
				liveConfig = {
					genre: liveConfig[ 0 ] ,
					advance_show: liveConfig[ 1 ] ,
					specific_show: liveConfig[ 2 ] ,
					specific_episode: liveConfig[ 3 ] ,
					mount_point: liveConfig[ 4 ]
				};
			}
			//console.log( liveConfig );
			resolve( liveConfig );
		}
		catch( error ) { console.log( error ); resolve( undefined ); }
	});
}
module.exports.getLiveConfig = GET_LIVE_CONFIG;

function GET_LAST_PLAYED_GLOBAL() {
	return new Promise( async function( resolve , reject ) {
		try {
			let liveLastPlayed = await Redis.keyGet( RC.LAST_SS.NOW_PLAYING_GLOBAL );
			liveLastPlayed = JSON.parse( liveLastPlayed );
			resolve( liveLastPlayed );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getLastPlayedGlobal = GET_LAST_PLAYED_GLOBAL;

function GET_LAST_PLAYED_IN_GENRE( wGenre ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wGenre ) { resolve(); return; }
			let liveLastPlayed = await Redis.keyGet( RC.LAST_SS.NOW_PLAYING[ wGenre ] );
			liveLastPlayed = JSON.parse( liveLastPlayed );
			resolve( liveLastPlayed );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getLastPlayedInGenre = GET_LAST_PLAYED_IN_GENRE;

function GET_CURRENT_SHOW_IN_GENRE( wGenre ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let show_index_key = "LOCAL_MEDIA.GENRES." + wGenre + ".SHOWS.INDEX";
			let show_index = await Redis.keyGet( show_index_key );

			let show_key = "LOCAL_MEDIA.GENRES." + wGenre + ".SHOWS";
			let show_name = await Redis.listGetByIndex( show_key , show_index );
			resolve( show_name );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getCurrentShowInGenre = GET_CURRENT_SHOW_IN_GENRE;

function GET_CURRENT_SEASON_IN_SHOW( wGenre , wShow ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let season_index = await Redis.keyGet( "LOCAL_MEDIA.GENRES." + wGenre + ".SHOWS." + wShow + ".SEASONS.INDEX" );
			resolve( season_index );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getCurrentSeasonInShow = GET_CURRENT_SEASON_IN_SHOW;

function GET_CURRENT_EPISODE_IN_SEASON( wGenre , wShow , wSeason ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let episode_index = await Redis.keyGet( "LOCAL_MEDIA.GENRES." + wGenre + ".SHOWS." + wShow + ".SEASONS." + wSeason.toString() + ".EPISODES.INDEX" )
			resolve( episode_index );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getCurrentEpisodeInSeason = GET_CURRENT_EPISODE_IN_SEASON;

function GET_CURRENT_EPISODE_IN_SEASON( wGenre , wShow , wSeason ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let episode_index = await Redis.keyGet( "LOCAL_MEDIA.GENRES." + wGenre + ".SHOWS." + wShow + ".SEASONS." + wSeason.toString() + ".EPISODES.INDEX" )
			resolve( episode_index );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getCurrentEpisodeInSeason = GET_CURRENT_EPISODE_IN_SEASON;

function GET_CURRENT_EPISODE_IN_GENRE( wGenre ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wGenre ) { resolve( [ undefined  ,undefined ] ); return; }
			//console.log( wGenre );
			let show = await GET_CURRENT_SHOW_IN_GENRE( wGenre );
			//console.log( show );
			let season_index = await GET_CURRENT_SEASON_IN_SHOW( wGenre , show );
			//console.log( season_index );
			let episode_index = await GET_CURRENT_EPISODE_IN_SEASON( wGenre , show , season_index );
			//console.log( episode_index );
			let key = RC.PASSIVE.BASE + "GENRES." + wGenre + ".SHOWS." + show + ".SEASONS." + season_index.toString() + ".EPISODES." + episode_index.toString();
			//console.log( key );
			let episode = await Redis.hashGetAll( key );
			resolve( [ episode , key ] );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getCurrentEpisodeInGenre = GET_CURRENT_EPISODE_IN_GENRE;

function UPDATE_DURATION( wEpisode ) {
	return new Promise( async function( resolve , reject ) {
		try {
			wEpisode.duration = wEpisode.remaining_time = await GetDuration( wEpisode.fp );
			wEpisode.three_percent = Math.floor( ( wEpisode.duration - ( wEpisode.duration * 0.025 ) ) );
			await Redis.hashSetMulti( wEpisode.passive_episode_key , "duration" , wEpisode.duration , "three_percent" , wEpisode.three_percent );
			resolve( wEpisode );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.updateDuration = UPDATE_DURATION;