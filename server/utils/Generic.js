const request = require( "request" );
const path = require( "path" );
require( "shelljs/global" );

const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const MainFPMJS = path.join( MainFP , "main.js" );
const Redis = require( MainFPMJS ).redis;

//const MonthNames = require( MainFPMJS ).constants.MonthNames;
const MonthNames = require( path.join( MainFP , "server" , "constants" , "generic.js" ) ).MonthNames;
const StatusKeys = require( MainFPMJS ).rc.STATUS;
const Reporter = require( MainFPMJS , "server" , "utils" , "Reporter.js" );

function W_SLEEP( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
module.exports.sleep = W_SLEEP;

function getRandomFromRange( wMin , wMax ) { return Math.floor( Math.random() * ( wMax - wMin + 1 ) ) + wMin; }
function getRandomPropertyKey( wOBJ ) { var keys = Object.keys( wOBJ ); return keys[ keys.length * Math.random() << 0 ]; }
function getRandomArrayItem( wArray ) { return wArray[ Math.floor( Math.random() * wArray.length ) ]; }
Math.seed = function( s ) { return function() { s = Math.sin( s ) * 10000; return s - Math.floor( s ); }; };
function reSeedMathRandom() {
	let wRanSeedStart = getRandomFromRange( 1 , 100 );
	let random1 = Math.seed( wRanSeedStart );
	let random2 = Math.seed( random1() );
	Math.random = Math.seed( random2() );
}
module.exports.reSeedMathRandom = reSeedMathRandom;
function shuffleArray( array ) {
	reSeedMathRandom();
    for ( let i = array.length - 1; i > 0; i-- ) {
    	reSeedMathRandom();
        const j = Math.floor( Math.random() * ( i + 1 ) );
        [ array[ i ] , array[ j ] ] = [ array[ j ] , array[ i ] ];
    }
    return array;
}
module.exports.shuffleArray = shuffleArray;

function GET_NOW_TIME() {
	const today = new Date();
	var day = today.getDate();
	if ( parseInt( day ) < 10 ) { day = "0" + day; }
	const month = MonthNames[ today.getMonth() ];
	const year = today.getFullYear();
	var hours = today.getHours();
	if ( parseInt( hours ) < 10 ) { hours = "0" + hours; }
	var minutes = today.getMinutes();
	if ( parseInt( minutes ) < 10 ) { minutes = "0" + minutes; }
	var seconds = today.getSeconds();
	if ( parseInt( seconds ) < 10 ) { seconds = "0" + seconds; }
	var milliseconds = today.getMilliseconds();
	const mi = parseInt( milliseconds );
	if ( mi < 10 ) { milliseconds = "00" + milliseconds; }
	else if ( mi < 100 ) { milliseconds = "0" + milliseconds; }
	return day + month + year + " @ " + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}
module.exports.time = GET_NOW_TIME;


function FIX_PATH_SPACE( wFP ) {
	var fixSpace = new RegExp( " " , "g" );
	wFP = wFP.replace( fixSpace , String.fromCharCode(92) + " " );
	wFP = wFP.replace( ")" , String.fromCharCode(92) + ")" );
	wFP = wFP.replace( "(" , String.fromCharCode(92) + "(" );
	wFP = wFP.replace( "'" , String.fromCharCode(92) + "'" );
	return wFP;
}
module.exports.fixPathSpace = FIX_PATH_SPACE;

function GET_DURATION( wFP ) {
	try {
		wFP = FIX_PATH_SPACE( wFP );
		var z1 = "ffprobe -v error -show_format -i " + wFP;
		var x1 = exec( z1 , { silent: true , async: false } );
		if ( x1.stderr ) { return( x1.stderr ); }
		var wMatched = x1.stdout.match( /duration="?(\d*\.\d*)"?/ );
		var f1 = Math.floor( wMatched[1] );
		return f1;
	}
	catch( error ) { console.log( error ); }
}
module.exports.getDuration = GET_DURATION;

function SET_STAGED_FF_CLIENT_TASK( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const STAGED_FF_CLIENT_TASK = JSON.stringify( wOptions );
			await Redis.keySet( "STAGED_FF_TASK" , STAGED_FF_CLIENT_TASK );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.setStagedFFClientTask = SET_STAGED_FF_CLIENT_TASK;

function GET_STAGED_FF_CLIENT_TASK( wDontParse ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var STAGED_FF_CLIENT_TASK = await Redis.keyGet( "STAGED_FF_TASK" );
			if ( !wDontParse ) { STAGED_FF_CLIENT_TASK = JSON.parse( STAGED_FF_CLIENT_TASK ); }
			resolve( STAGED_FF_CLIENT_TASK );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getStagedFFClientTask = GET_STAGED_FF_CLIENT_TASK;

function GET_STATUS_REPORT() {
	return new Promise( async function( resolve , reject ) {
		try {
			var wStatusReport = await Redis.keyGetMulti( ...StatusKeys );
			//var discord_post = "\n\nSTATUS REPORT ====\n";
			let final_report = {};
			for ( var i = 0; i < StatusKeys.length; ++i ) {
				final_report[ StatusKeys[ i ] ] = wStatusReport[ i ];
				//discord_post = discord_post + StatusKeys[ i ] + " === " +wStatusReport[ i ] + "\n";
			}
			//console.log( discord_post );
			//Reporter.log( discord_post );
			resolve( final_report );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getStatusReport = GET_STATUS_REPORT;


function CHECK_STATUS( wComponent ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var isComponentLive = await Redis.keyGet( "STATUS." + wComponent );
			var answer = false;
			if ( isComponentLive ) {
				if ( isComponentLive === "ONLINE" ) { answer = true; }
			}
			resolve( answer );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.checkStatus = CHECK_STATUS;

function SET_STATUS( wComponent , wStatus ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await Redis.keySet( "STATUS." + wComponent , wStatus );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.setStatus = SET_STATUS;


function REBOOT_ROUTER() {
	return new Promise( async function( resolve , reject ) {
		try {
			var wURL = "http://192.168.0.1/goform/login";
			var wBody = "loginUsername=admin&loginPassword=admin";
			console.log( wURL );
			request.post({
			  headers: { "content-type": "application/x-www-form-urlencoded" },
			  url:     wURL ,
			  body:    wBody ,
			}, function( error, response, body){
				console.log( body );
			  	var w1URL = "http://192.168.0.1/goform/RgSecurity";
				var w1Body = "UserId=&OldPassword=&Password=&PasswordReEnter=&ResRebootYes=0x01&RestoreFactoryNo=0x00&RgRouterBridgeMode=1";
				console.log( w1URL );
				request.post({
				  headers: { "content-type" : "application/x-www-form-urlencoded" },
				  url:     w1URL ,
				  body:    w1Body ,
				}, function( w1error, w1response, w1body){
				  console.log( w1body );
				  resolve();
				});

			});

		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.rebootRouter = REBOOT_ROUTER;


function RESTART_PM2() {
	return new Promise( function( resolve , reject ) {
		try {
			exec( "pm2 restart Box4" , { silent: true , async: false } );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.restartPM2 = RESTART_PM2;


function OS_COMMAND( wTask ) {
	return new Promise( function( resolve , reject ) {
		try {
			var result = null;
			console.log( "EXEC --> " + wTask );
			var x1 = exec( wTask , { silent: true , async: false } );
			if ( x1.stderr ) { result = x1.stderr }
			else { result = x1.stdout.trim() }
			resolve( result );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.osCommand = OS_COMMAND;

function CLOSE_EVERYTHING() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../modules/mopidy/Manager.js" ).shutdown();
			await require( "../modules/localmedia/Manager.js" ).shutdown();
			setTimeout( ()=> {
				exec( "sudo pkill -9 firefox" , { silent: true ,  async: false } );
				exec( "sudo pkill -9 mplayer" , { silent: true ,  async: false } );
				resolve();
			} , 2000 );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.closeEverything = CLOSE_EVERYTHING;


function CLOSE_COMMON() {
	return new Promise( function( resolve , reject ) {
		try {
			exec( "sudo pkill -9 firefox" , { silent: true ,  async: false } );
			exec( "sudo pkill -9 mplayer" , { silent: true ,  async: false } );
			resolve()
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.closeCommon = CLOSE_COMMON;

const ServerOnlineMP3_FP = path.join( MainFP , "server" , "sounds" , "VoHiYo.mp3" );
function PLAY_SERVER_ONLINE_SOUND() {
	return new Promise( function( resolve , reject ) {
		try {
			exec( "mpg123 " + ServerOnlineMP3_FP , { silent: true ,  async: false } );
			resolve()
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.playServerOnlineSound = PLAY_SERVER_ONLINE_SOUND;

function getStackTrace () {
	let stack = new Error().stack || "";
	stack = stack.split( "\n" ).map( function ( line ) { return line.trim(); } );
	return stack.splice( stack[ 0 ] == "Error" ? 2 : 1 );
}
module.exports.getStackTrace = getStackTrace;

function GET_CALLER() {

	// let stack = StackTrace.getSync();
	// let filtered = stack.filter( x => x.fileName.indexOf( "Reporter.js" ) === -1 );
	// if ( !filtered[ 0 ] ) { console.log( stack ); /*console.trace();*/ return "unknown"; }
	// let name = filtered[ 0 ].fileName.split( "/Box4" )[ 1 ];
	// return name;

	let stack = getStackTrace();
	let name = stack[ stack.length - 1 ].split( "/Box4" )[ 1 ].split( ":" )[ 0 ];
	return name;
}
module.exports.getCaller = GET_CALLER;