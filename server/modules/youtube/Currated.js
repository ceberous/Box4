const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.YOUTUBE.CURRATED;

function GET_QUE() {
	return new Promise( async function( resolve , reject ) {
		try {
			const list = await Redis.setGetFull( RC.QUE );
			resolve( list );
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
module.exports.getQue = GET_QUE;

function ADD_TO_QUE( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( wVideoID ) {
				if ( wVideoID.length > 10 ) {
					await Redis.setAdd( RC.QUE , wVideoID );
				}
			}
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
module.exports.addToQue = ADD_TO_QUE;

function REMOVE_FROM_QUE( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await Redis.setRemove( RC.QUE , wVideoID );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
module.exports.removeFromQue = REMOVE_FROM_QUE;


function IMPORT_FROM_PLAYLIST_ID( wPlaylistID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let videos = await require( "./API.js" ).getPlaylist( wPlaylistID );
			let ids = videos.map( x => x[ "videoId" ] );
			let filtered_ids = await require( "./Generic.js" ).filterCommon( ids );
			Reporter.log( "Filtered IDS === " );
			Reporter.log( filtered_ids );
			await Redis.setSetFromArray( RC.QUE , filtered_ids );
			resolve( filtered_ids );
		}
		catch( error ) { Reporter.error( error ); reject( error ); }
	});
}
module.exports.importFromPlaylistID = IMPORT_FROM_PLAYLIST_ID;


function GET_NEXT_IN_QUE() {
	return new Promise( async function( resolve , reject ) {
		try {
			var next_video = await Redis.setGetRandomMembers( RC.QUE , 1 );
			if ( !next_video ) { next_video = "empty" }
			else { next_video = next_video[ 0 ]; }
			resolve( next_video );
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
module.exports.getNextInQue = GET_NEXT_IN_QUE;