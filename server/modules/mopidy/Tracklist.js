const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
//const Redis = require( path.join( MainFP , "main.js" ) ).redis;
//const RC = Redis.c.MOPIDY;

const mopidy = require( path.join( MainFP , "server" , "modules" , "mopidy" , "Manager.js" ) ).mopidy;
const Sleep = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).sleep;

function CLEAR_LIST() {
	return new Promise( function( resolve , reject ) {
		try { mopidy.tracklist.clear().then( function( result ) { resolve( "success" ); } ); }
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function LOAD_LIST( wTrackList ) {
	return new Promise( function( resolve , reject ) {
		try { mopidy.tracklist.add( { tracks: wTrackList } ).then( function( result ) { resolve( "success" ); } ); }
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;
module.exports.loadList = LOAD_LIST;
module.exports.clearList = CLEAR_LIST;