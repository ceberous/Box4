const colors = require("colors");
const StackTrace = require( "stacktrace-js" );
const Sleep = require( "./Generic.js" ).sleep;
const NowTime = require( "./Generic.js" ).time;
const personal = require( "../../main.js" ).personal;
//const Reporter = require( "lilreporter" );
//let reporter;
const Eris = require( "eris" );
const DiscordCommands = require( "./DiscordCommands.js" );
let discordBot;
let discordCommandsBox = {};

function getStackTrace () {
    let stack = new Error().stack || "";
    stack = stack.split( "\n" ).map( function ( line ) { return line.trim(); } );
    return stack.splice( stack[ 0 ] == "Error" ? 2 : 1 );
}

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

const CALLER_COLOR_TABLE = {
	"unknown": [ "[UNKNOWN] --> " , "black" , "bgWhite" ] ,
	"/main.js": [ "[MAIN] --> " , "black" , "bgRed" ] ,
	"/server/utils/XDoTool.js": [ "[XDO_TOOL] --> " , "blue" , "bgRed" ] ,
	"/server/WebSocketManager.js": [ "[WebSocket] --> " , "rainbow" ] ,
	"/server/StateManager.js" : [ "[STATE_MAN] --> " , "black" , "bgWhite" ] ,
	"/server/modules/mplayer/Manager.js" : [ "[MPLAYER_MAN] --> " , "black" , "bgMagenta" ] ,
	"/server/modules/localmedia/Manager.js" : [ "[LOCALMEDIA] --> " , "magenta" , "bgBlack" ] ,
	"/server/modules/localmedia/utils/HardDrive.js" : [ "[LOCALMEDIA].hardDrive() --> " , "magenta" , "bgBlack" ] ,
	"/server/modules/localmedia/utils/Calculate.js" : [ "[LOCALMEDIA].calculate() --> " , "magenta" , "bgBlack" ] ,
	"/server/modules/youtube/Utils.js" : [ "[YOUTUBE_UTILS] --> " , "white" , "bgRed" ] ,
	"/server/modules/youtube/Currated.js" : [ "[YOUTUBE_CURRATED] --> " , "white" , "bgRed" ] ,
	"/server/modules/youtube/Live.js" : [ "[YOUTUBE_LIVE] --> " , "white" , "bgRed" ] ,
	"/server/modules/youtube/Standard.js" : [ "[YOUTUBE_STANDARD] --> " , "white" , "bgRed" ] ,
	"/server/modules/mopidy/Manager.js" : [ "[MOPIDY] --> " , "white" , "bgBlue" ] ,
	"/server/modules/mopidy/Library.js" : [ "[MOPIDY_LIBRARY] --> " , "white" , "bgBlue" ] ,
	"/server/modules/mopidy/Playback.js" : [ "[MOPIDY_PLAYBACK] --> " , "white" , "bgBlue" ] ,
	"/server/modules/mopidy/Tracklist.js" : [ "[MOPIDY_TRACKLIST] --> " , "white" , "bgBlue" ] ,
	"/server/modules/mopidy/Utils.js" : [ "[MOPIDY_UTILS] --> " , "white" , "bgBlue" ] ,
	"/server/modules/mopidy/RestartContinuousPlay.js" : [ "[MOPIDY_CONTINOUS_PLAY] --> " , "white" , "bgBlue" ] ,
	"/server/states/YoutubeLive.js" : [ "[STATE_YOUTUBE_LIVE] --> " , "white" , "bgRed" ] ,
	"/server/states/YoutubeStandard.js" : [ "[STATE_YOUTUBE_STANDARD] --> " , "white" , "bgRed" ] ,
	"/server/states/TwitchLive.js" : [ "[STATE_TWITCH_LIVE] --> " , "white" , "bgMagenta" ] ,
	"/server/states/LocalMediaTVShow.js" : [ "[STATE_LOCALMEDIA_TVSHOW] --> " , "magenta" , "bgBlack" ] ,
	"/server/states/LocalMediaAudioBook.js" : [ "[STATE_LOCALMEDIA_AUDIOBOOK] --> " , "magenta" , "bgBlack" ] ,
	"/server/states/LocalMediaMusic.js" : [ "[STATE_LOCALMEDIA_MUSIC] --> " , "magenta" , "bgBlack" ] ,
	"/server/states/LocalMediaMovie.js" : [ "[STATE_LOCALMEDIA_MOVIE] --> " , "magenta" , "bgBlack" ] ,
	"/server/states/LocalMediaOdyssey.js" : [ "[STATE_LOCALMEDIA_ODYSSEY] --> " , "magenta" , "bgBlack" ] ,
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
			//console.log( wMSG );
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
			//LOCAL_LOG( wMSG );
			console.log( wMSG );
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
			await discordBot.createMessage( personal.discord.channels.log , wMSG );
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
			await discordBot.createMessage( personal.discord.channels.now_playing , wMSG );
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
			await discordBot.createMessage( personal.discord.channels.error , wMSG );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.remote = {
	log: REMOTE_LOG ,
	error: REMOTE_ERROR ,
	post: REMOTE_POST ,
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
			//reporter = new Reporter( { discord: personal.discord } );
			//await reporter.init();
			//module.exports.reporter = reporter;

			discordBot = new Eris.CommandClient( personal.discord.token , {} , {
				description: "MediaBrowser Controller" ,
				owner: personal.discord.bot_id ,
				prefix: "!"
			});

			for ( var group in DiscordCommands ) {
				discordCommandsBox[ group ] = {};
				for ( var command in DiscordCommands[ group ] ) {
					discordCommandsBox[ group ][ command ] = discordBot.registerCommand( command , DiscordCommands[ group ][ command ].fn , DiscordCommands[ group ][ command ].config );
					if ( DiscordCommands[ group ][ command ].alias ) {
						for ( let i = 0; i < DiscordCommands[ group ][ command ].alias.length; ++i ) {
							discordBot.registerCommandAlias( DiscordCommands[ group ][ command ].alias[ i ] , command );
						}
					}
					if ( DiscordCommands[ group ][ command ].sub ) {
						for ( var subcommand in DiscordCommands[ group ][ command ].sub ) {
							discordCommandsBox[ group ][ command ].registerSubcommand( subcommand , DiscordCommands[ group ][ command ].sub[ subcommand ].fn , DiscordCommands[ group ][ command ].sub[ subcommand ].config );
							if ( DiscordCommands[ group ][ command ].sub[ subcommand ].alias ) {
								for ( let j = 0; j < DiscordCommands[ group ][ command ].sub[ subcommand ].alias.length; ++j ) {
									discordCommandsBox[ group ][ command ].registerSubcommandAlias( DiscordCommands[ group ][ command ].sub[ subcommand ].alias[ j ] , subcommand );
								}
							}
						}
					}
				}
			}

			await discordBot.connect();
			await Sleep( 2000 );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;