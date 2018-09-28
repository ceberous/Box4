const Reporter = require( "lilreporter" );
const StackTrace = require( "stacktrace-js" );
const Sleep = require( "./Generic.js" ).sleep;
const NowTime = require( "./Generic.js" ).time;
let reporter;

function GET_CALLER() {
	let stack = StackTrace.getSync();
	stack = stack.filter( x => x.fileName.indexOf( "Reporter.js" ) === -1 );
	return stack[ 0 ].fileName.split( "/Box4" )[ 1 ];
}

const CALLER_COLOR_TABLE = {
	"/server/StateManager.js" : [ "[STATE_MAN] --> " , "black" , "bgWhite" ] ,
};

function LOCAL_GET_MESSAGE_CUSTOM( wMSG ) {
	let caller = GET_CALLER();
	if ( !CALLER_COLOR_TABLE[ caller ] ) { return undefined; }
	return CALLER_COLOR_TABLE[ caller ];
}

function PREFACE_MESSAGE( wMSG , wPrefix ) {
	let now_time = NowTime();
	return now_time + " === " + "**" + wPrefix + "**" + wMSG;
}

function LOCAL_LOG( wMSG ) {
	return new Promise( function( resolve , reject ) {
		try {
			if ( !wMSG ) { return; }
			if ( wMSG.length < 1 ) { return; }
			let msg_config = LOCAL_GET_MESSAGE_CUSTOM();
			let x1 = wSTR;	
			if ( wColorsConfig.length > 0 ) {
				if ( wColorsConfig.length === 3 ) {
					console.log( colors[ wColorsConfig[ 0 ] ][ wColorsConfig[ 1 ] ]( x1 ) );
				}
				else {
					console.log( colors[ wColorsConfig[ 0 ] ]( x1 ) );
				}
			}
			else { console.log( x1 ); }
			if ( wPrefix ) { wSTR = now_time + " === " + "**" + wPrefix + "**" + wSTR; }
			else { wSTR = now_time + " === " + wSTR; }
			Reporter.log( wSTR );			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function LOCAL_ERROR( wMSG ) {
	return new Promise( function( resolve , reject ) {
		try {
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
			await reporter.log( wMSG );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REMOTE_POST( wMSG ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await reporter.post( wMSG );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REMOTE_ERROR( wMSG ) {
	return new Promise( async function( resolve , reject ) {
		try {
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
			await REMOTE_LOG( wMSG );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.log = LOG;

function POST( wMSG ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const now_time = GET_NOW_TIME();
			wMSG = now_time + 
			LOCAL_LOG( wMSG );
			await REMOTE_LOG( wMSG );
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
			await REMOTE_ERROR( wMSG );
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