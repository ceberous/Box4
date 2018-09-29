const Reporter = require( "lilreporter" );
const colors = require("colors");
const StackTrace = require( "stacktrace-js" );
const Sleep = require( "./Generic.js" ).sleep;
const NowTime = require( "./Generic.js" ).time;
let reporter;

function GET_CALLER() {
	let stack = StackTrace.getSync();
	stack = stack.filter( x => x.fileName.indexOf( "Reporter.js" ) === -1 );
	let name = stack[ 0 ].fileName.split( "/Box4" )[ 1 ];
	//console.log( name );
	return name;
}

const CALLER_COLOR_TABLE = {
	"/main.js": [ "[MAIN] --> " , "black" , "bgRed" ] , 
	"/server/WebSocketManager.js": [ "[WebSocket] --> " , "rainbow" ] ,
	"/server/StateManager.js" : [ "[STATE_MAN] --> " , "black" , "bgWhite" ] ,
	"/server/modules/localmedia/Manager.js" : [ "[LOCAL_MEDIA_MAN] --> " , "magenta" , "bgBlack" ] ,
	"/server/modules/youtube/Utils.js" : [ "[YOU_TUBE_UTILS] --> " , "white" , "bgRed" ] ,
	"/server/modules/youtube/Currated.js" : [ "[YOU_TUBE_CURRATED] --> " , "white" , "bgRed" ] ,
	"/server/modules/youtube/Live.js" : [ "[YOU_TUBE_LIVE] --> " , "white" , "bgRed" ] ,
	"/server/modules/youtube/Standard.js" : [ "[YOU_TUBE_STANDARD] --> " , "white" , "bgRed" ] ,
};

function LOCAL_GET_MESSAGE_CUSTOM( wMSG ) {
	let caller = GET_CALLER();
	if ( !CALLER_COLOR_TABLE[ caller ] ) { return undefined; }
	return CALLER_COLOR_TABLE[ caller ];
}

function LOCAL_PREFACE_MESSAGE( wMSG , wPrefix ) {
	let now_time = NowTime();
	return now_time + " === " + wPrefix + wMSG;
}

function REMOTE_PREFACE_MESSAGE( wMSG , wPrefix ) {
	let now_time = NowTime();
	return now_time + " === " + "**" + wPrefix + "**" + wMSG;
}

function LOCAL_LOG( wMSG ) {
	return new Promise( function( resolve , reject ) {
		try {
			if ( !wMSG ) { return; }
			if ( wMSG.length < 1 ) { return; }
			let msg_config = LOCAL_GET_MESSAGE_CUSTOM();
			wMSG = LOCAL_PREFACE_MESSAGE( wMSG  , msg_config[ 0 ] );
			if ( msg_config.length > 0 ) {
				if ( msg_config.length === 3 ) {
					console.log( colors[ msg_config[ 1 ] ][ msg_config[ 2 ] ]( wMSG ) );
				}
				else if ( msg_config.length === 2 ) {
					console.log( colors[ msg_config[ 1 ] ]( wMSG ) );
				}
				else {
					console.log( wMSG );
				}
			}		
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function LOCAL_ERROR( wMSG ) {
	return new Promise( function( resolve , reject ) {
		try {
			LOCAL_LOG( wMSG );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.local = {
	log: LOCAL_LOG ,
	error: LOCAL_ERROR
};

function REMOTE_LOG( wMSG ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let msg_config = LOCAL_GET_MESSAGE_CUSTOM();
			if ( !msg_config ) { resolve(); return; }
			wMSG = REMOTE_PREFACE_MESSAGE( wMSG  , msg_config[ 0 ] );
			await reporter.log( wMSG );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REMOTE_POST( wMSG ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let msg_config = LOCAL_GET_MESSAGE_CUSTOM();
			if ( !msg_config ) { resolve(); return; }
			wMSG = REMOTE_PREFACE_MESSAGE( wMSG  , msg_config[ 0 ] );
			await reporter.post( wMSG );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REMOTE_ERROR( wMSG ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let msg_config = LOCAL_GET_MESSAGE_CUSTOM();
			if ( !msg_config ) { resolve(); return; }
			wMSG = REMOTE_PREFACE_MESSAGE( wMSG  , msg_config[ 0 ] );			
			await reporter.error( wMSG );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.remote = {
	log: REMOTE_LOG ,
	error: REMOTE_ERROR
};

function LOG( wMSG ) {
	return new Promise( async function( resolve , reject ) {
		try {
			LOCAL_LOG( wMSG );
			//await REMOTE_LOG( wMSG );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.log = LOG;

function POST( wMSG ) {
	return new Promise( async function( resolve , reject ) {
		try {
			LOCAL_LOG( wMSG );
			await REMOTE_POST( wMSG );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.post = POST;

function ERROR( wMSG ) {
	return new Promise( async function( resolve , reject ) {
		try {
			LOCAL_ERROR( wMSG );
			//await REMOTE_ERROR( wMSG );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.error = ERROR;

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			let personal = require( "../../main.js" ).personal;
			reporter = new Reporter( { discord: personal.discord } );
			await reporter.init();
			module.exports.reporter = reporter;
			await Sleep( 2000 );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;