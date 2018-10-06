const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.LOCAL_MEDIA;

const LocalMediaManager = require( path.join( MainFP , "server" , "modules" , "localmedia" , "Manager.js" ) );

const default_config = {
	genre: "tvshows" ,
	advance_show: "true" ,
	specific_show: "false" ,
	specific_season: "false" ,
	specific_episode: "false" ,
};
function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let final_options = default_config;
			if ( wOptions ) {
				if ( wOptions.genre ) {
					final_options = wOptions;
				}
			}
			await Redis.keySetMulti( [
				[ "set" , RC.CONFIG.GENRE , final_options.genre ] ,
				[ "set" , RC.CONFIG.ADVANCE_SHOW , final_options.advance_show ] ,
				[ "set" , RC.CONFIG.SPECIFIC_SHOW , final_options.specific_show ] ,
				[ "set" , RC.CONFIG.SPECIFIC_EPISODE , final_options.specific_episode ] ,
			]);
			await LocalMediaManager.play( final_options );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
function wPause() {
	return new Promise( async function( resolve , reject ) {
		try {
			await LocalMediaManager.pause();
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
function wResume() {
	return new Promise( async function( resolve , reject ) {
		try {
			await LocalMediaManager.resume();
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await LocalMediaManager.stop();
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			await LocalMediaManager.next();
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			await LocalMediaManager.previous();
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.resume = wResume;
module.exports.stop = wStop;
module.exports.next = wNext;
module.exports.previous = wPrevious;