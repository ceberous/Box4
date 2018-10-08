const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.MOPIDY;

const mopidy = require( path.join( MainFP , "server" , "modules" , "mopidy" , "Manager.js" ) ).mopidy;
const Sleep = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).sleep;

const TracklistManger_FP = require( path.join( MainFP , "server" , "modules" , "mopidy" , "Tracklist.js" ) );
const PlaybackManger_FP = require( path.join( MainFP , "server" , "modules" , "mopidy" , "Playback.js" ) );

const R_KEY_BASE = "MOPIDY.CACHE."
const R_LAST_SS_BASE = "LAST_SS.MOPIDY.";
const R_CONTINOUS_PLAY = R_LAST_SS_BASE + "CONTINUOUS_PLAY";
module.exports.restart =  function() {
	return new Promise( async function( resolve , reject ) {
		try {

			let now_playing_button_genre = await Redis.keyGet( R_CONTINOUS_PLAY );
			if ( now_playing_button_genre === null ) { now_playing_button_genre = "UNKNOWN"; }
			console.log( "RESTARTING LIVE RANDOM GENRE LIST -- " + now_playing_button_genre );

			const R_K1 = R_KEY_BASE + now_playing_button_genre;
			let random_list = await Redis.setPopRandomMembers( R_K1 , 25 );
			random_list = random_list.map( x => JSON.parse( x ) );
			// for ( var i = 0; i < random_list.length; ++i ) {
			// 	random_list[ i ] = JSON.parse( random_list[ i ] );
			// }
			await require( TracklistManger_FP ).clearList();
			await require( TracklistManger_FP ).loadList( random_list );
			await require( PlaybackManger_FP ).play();
			await Sleep( 2000 );
			await require( PlaybackManger_FP ).getState();

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
};