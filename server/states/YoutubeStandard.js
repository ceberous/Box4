const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.YOUTUBE.STANDARD;
const wEmitter = require( path.join( MainFP , "main.js" ) ).emitter;
const SetStagedFFClientTask = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).setStagedFFClientTask;
const FirefoxManager = require( path.join( MainFP , "server" , "modules" , "firefox" , "Firefox.js" ) );

function GET_NEXT_VIDEO() {
	return new Promise( async function( resolve , reject ) {
		try {
			let finalVideo = await Redis.setPopRandomMembers( RC.STANDARD.LATEST , 1 );
			if ( finalVideo.length < 1 ) { Reporter.log( "No Standard Videos Left" ); resolve(); return; }
			else { finalVideo = finalVideo[ 0 ]; }			
			Reporter.log( finalVideo );
			// WutFace https://stackoverflow.com/questions/17060672/ttl-for-a-set-member
			await Redis.setMulti( [ 
				[ "sadd" , RC.ALREADY_WATCHED , finalVideo ] ,
				[ "set" , RC.NOW_PLAYING_KEY , finalVideo ] , 
			]);			
			resolve( finalVideo );
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			//await require( "../youtubeManager.js" ).updateStandard();
			var final_vid = await GET_NEXT_VIDEO();
			await SetStagedFFClientTask( { message: "YTStandardForeground" , playlist: [ final_vid ]  } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtubeStandard" );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "pause" );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../firefoxManager.js" ).terminateFFWithClient();
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			var final_vid = await GET_NEXT_VIDEO();
			wEmitter.emit( "sendFFClientMessage" , "next" , final_vid );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function wPrevious() { // ehhhh needs fixed
	return new Promise( async function( resolve , reject ) {
		try {
			var final_vid = await GET_NEXT_VIDEO();
			wEmitter.emit( "sendFFClientMessage" , "next" , final_vid );
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;
module.exports.next = wNext;
module.exports.previous = wPrevious;