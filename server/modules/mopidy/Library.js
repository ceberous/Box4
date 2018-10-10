const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const Personal = require( path.join( MainFP , "main.js" ) ).personal.mopidy;
const RC = Redis.c.MOPIDY;

const mopidy = require( path.join( MainFP , "server" , "modules" , "mopidy" , "Manager.js" ) ).mopidy;
const Sleep = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).sleep;
const ShuffleArray = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).shuffleArray;

function GET_PLAYLISTS() {
	return new Promise( async function( resolve , reject ) {
		try {
			mopidy.playlists.getPlaylists().then( function( playlists ) {
				resolve( playlists );
			})
			.catch( function( wError ) {
				Reporter.log( "ERROR --> " + wError );
				reject();
			});
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

// Addd in Different "relax" lables later to be manually started via web-panel
const HOUR = 3600000;
const DAY = 86400000;
function UPDATE_CACHE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await Redis.deleteMultiplePatterns( [ "MOPIDY.GENERES.*" ] );
			let playlists = await GET_PLAYLISTS();
			//console.log( playlists );
			for ( let i = 0; i < playlists.length; ++i ) {
				for ( genre in Personal.spotify.genres ) {
					// If There Is a Label for This Playlist , store in right redis key
					if ( Personal.spotify.genres[ genre ].indexOf( playlists[ i ].uri ) !== -1 ) {
						await Redis.setAdd( RC.GENRES[ genre ].PLAYLISTS , playlists[ i ].uri );
						//await Redis.listSetFromArray( RC.GENRES[ genre ].TRACKS , playlists[ i ].tracks.map( x => JSON.stringify( x ) ) );
						await Redis.setSetFromArray( RC.GENRES[ genre ].TRACKS , ShuffleArray( playlists[ i ].tracks.map( x => JSON.stringify( x ) ) ) );
						//await Redis.setSetFromArray( RC.GENRES[ genre ].TRACKS + "." + playlists[ i ].uri , playlists[ i ].tracks.map( x => x.uri ) );
					}
					else {
						await Redis.setAdd( RC.GENRES[ "unknown" ].PLAYLISTS , playlists[ i ].uri );
						await Redis.setSetFromArray( RC.GENRES[ "unknown" ].TRACKS , ShuffleArray( playlists[ i ].tracks.map( x => JSON.stringify( x ) ) ) );
					}
				}
			}

			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}


function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await Sleep( 1000 );
			await UPDATE_CACHE();
			Reporter.log( "LIBRARY-INITIALIZED" );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;
module.exports.updateCache = UPDATE_CACHE;