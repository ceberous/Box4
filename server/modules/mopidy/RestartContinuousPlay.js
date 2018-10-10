const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.MOPIDY;

const mopidy = require( path.join( MainFP , "server" , "modules" , "mopidy" , "Manager.js" ) ).mopidy;
const Sleep = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).sleep;

const TracklistManger_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "Tracklist.js" );
const PlaybackManger_FP = path.join( MainFP , "server" , "modules" , "mopidy" , "Playback.js" );

const GenericUtils_FP = path.join( MainFP , "server" , "utils" , "Generic.js" );

module.exports.restart = function() {
	return new Promise( async function( resolve , reject ) {
		try {
			let genre = await Redis.keyGet( RC.CONTINUOUS_GENRE );
			if ( genre === null ) { genre = "classic"; }
			console.log( "RESTARTING LIVE RANDOM GENRE LIST -- " + genre );
			let list = await Redis.setPopRandomMembers( RC.GENRES[ genre ].TRACKS , 25 );
			await Redis.setSetFromArray( RC.GENRES[ genre ].TRACKS + ".RECYCLED" , list );
			if ( list.length < 1 ) {
				await Redis.setStoreUnion( RC.GENRES[ genre ].TRACKS , RC.GENRES[ genre ].TRACKS + ".RECYCLED" );
				await Redis.keyDel( RC.GENRES[ genre ].TRACKS + ".RECYCLED" );
				list = await Redis.setPopRandomMembers( RC.GENRES[ genre ].TRACKS , 25 );
			}
			list = list.map( x => JSON.parse( x ) );
			list = require( GenericUtils_FP ).shuffleArray( list );
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