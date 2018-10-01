const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const path = require( "path" );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.LOCAL_MEDIA;

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

function UPDATE_LAST_PLAYED_TIME( wTime ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wTime ) { resolve(); return; }
			console.log( "Time = " + wTime.toString() );
			
			let now_playing = await Redis.keyGetDeJSON( RC.NOW_PLAYING.global );
			console.log( now_playing );
			if ( !now_playing ) { resolve(); return; }
			//console.log( "wTime === " + wTime.toString() );
			now_playing.current_time = wTime;
			now_playing.remaining_time = ( now_playing.duration - now_playing.current_time );
			await Redis.hashSetMulti( now_playing.episode_passive_key , 
				"current_time" , now_playing.current_time ,
				"remaining_time" , now_playing.remaining_time
			);
			if ( now_playing.current_time >= now_playing.three_percent ) {
				now_playing.completed = true;
				await Redis.hashSetMulti( now_playing.episode_passive_key , "completed" , true );
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