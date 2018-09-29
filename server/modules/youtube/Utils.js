const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const path = require( "path" );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.youtube;
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );

function FILTER_GLOBAL_BLACKLIST_AND_WATCHED_AND_SKIPPED( wNewIDS ) {
	return new Promise( async function( resolve , reject ) {
		try {
			Reporter.log( RC );
			const temp_skipped_key = "TMP_KEY.SKIPPED." + Math.random().toString(36).substring(7);
			const temp_blacklist_key = "TMP_KEY.BLACKLIST." + Math.random().toString(36).substring(7);
			const temp_watched_key = "TMP_KEY.WATCHED." + Math.random().toString(36).substring(7);

			let final_ids;
			let skipped = await Redis.setAddArrayWithFilter( temp_skipped_key , RC.SKIPPED , wNewIDS );
			if ( skipped ) { if ( skipped.length > 0 ) {
				final_ids = wNewIDS.filter( x => skipped.indexOf( x ) === -1 );
			}}
			let blacklisted = await Redis.setAddArrayWithFilter( temp_blacklist_key , RC.GLOBAL_BLACK_LIST , final_ids );
			if ( blacklisted ) { if ( blacklisted.length > 0 ) {
				final_ids = final_ids.filter( x => blacklisted.indexOf( x ) === -1 );
			}}			
			let watched = await Redis.setAddArrayWithFilter( temp_watched_key , RC.WATCHED , final_ids );
			if ( watched ) { if ( watched.length > 0 ) {
				final_ids = final_ids.filter( x => watched.indexOf( x ) === -1 );
			}}

			// ( rInstance , wDestinationKey , wFilterSetKey , wArray )
			// var final_ids = await Redis.setAddArrayWithFilter( temp_skipped_key , RC.SKIPPED , wNewIDS );
			// if ( final_ids ) {
			// 	if ( final_ids.length > 0 ) {
			// 		final_ids = await Redis.setAddArrayWithFilter( temp_blacklist_key , RC.GLOBAL_BLACK_LIST , final_ids );
			// 		if ( final_ids ) {
			// 			if ( final_ids.length > 0 ) {
			// 				final_ids = await Redis.setAddArrayWithFilter( temp_watched_key , RC.WATCHED , final_ids );
			// 			}
			// 		}
			// 	}
			// }
			await Redis.keyDel( temp_skipped_key );
			await Redis.keyDel( temp_watched_key );
			await Redis.keyDel( temp_blacklist_key );
			console.log( final_ids );
			resolve( final_ids );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.filterCommon = FILTER_GLOBAL_BLACKLIST_AND_WATCHED_AND_SKIPPED;

function RECORD_VIDEO_WATCHED( wID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await Redis.setAdd( RC.WATCHED , wID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.recordVideoWatched = RECORD_VIDEO_WATCHED;