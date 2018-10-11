const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.MOPIDY;

const mopidy = require( path.join( MainFP , "server" , "modules" , "mopidy" , "Manager.js" ) ).mopidy;
const Sleep = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).sleep;
const ShuffleArray = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).shuffleArray;

const TracklistManger_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "Tracklist.js" );
const PlaybackManger_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "Playback.js" );


module.exports.restart = function() {
	return new Promise( async function( resolve , reject ) {
		try {
			let genre = await Redis.keyGet( RC.CONTINUOUS_GENRE );
			if ( genre === null ) { genre = "classic"; }
			console.log( "RESTARTING LIVE RANDOM GENRE LIST -- " + genre );
			let list = await Redis.nextInCircularSet( RC.GENRES[ genre ].TRACKS , 25 );
			list = list.map( x => JSON.parse( x ) );
			list = ShuffleArray( list );
			await require( TracklistManger_FP ).clearList();
			await require( TracklistManger_FP ).loadList( list );
			await require( PlaybackManger_FP ).play();
			await Sleep( 2000 );
			await require( PlaybackManger_FP ).getState();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
};