const colors = require("colors");
const StackTrace = require( "stacktrace-js" );
const Sleep = require( "./Generic.js" ).sleep;
const NowTime = require( "./Generic.js" ).time;
const personal = require( "../../main.js" ).personal;
//const Reporter = require( "lilreporter" );
//let reporter;
const Eris = require( "eris" );
const Commands = require( "./DiscordCommands.js" );
let discordBot;

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
			//reporter = new Reporter( { discord: personal.discord } );
			//await reporter.init();
			//module.exports.reporter = reporter;

			discordBot = new Eris.CommandClient( personal.discord.token , {} , {
				description: "MediaBrowser Controller" ,
				owner: personal.discord.bot_id ,
				prefix: "!"
			});

			// Buttons
			// ========================================================================================
			// ========================================================================================
			let stopCommand = discordBot.registerCommand( "stop" , Commands.stop.fn , Commands.stop.config );
			discordBot.registerCommandAlias( "quit" , "stop" );
			let pauseCommand = discordBot.registerCommand( "pause" , Commands.pause.fn , Commands.pause.config );
			let previousCommand = discordBot.registerCommand( "previous" , Commands.previous.fn , Commands.previous.config );
			let nextCommand = discordBot.registerCommand( "next" , Commands.next.fn , Commands.next.config );
			// ========================================================================================
			// Buttons=================================================================================

			// Common State Names
			// ========================================================================================
			// ========================================================================================
			let relaxCommand = discordBot.registerCommand( "relax" , Commands.relax.fn , Commands.relax.config );
			discordBot.registerCommandAlias( "relaxing" , "relax" );

			let odyseeyCommand = discordBot.registerCommand( "odyseey" , Commands.odyseey.fn , Commands.odyseey.config );
			discordBot.registerCommandAlias( "od" , "odyseey" );
			discordBot.registerCommandAlias( "aio" , "odyseey" );

			let musicCommand = discordBot.registerCommand( "music" , Commands.music.fn , Commands.music.config );
			discordBot.registerCommandAlias( "mopidy" , "music" );
			musicCommand.registerSubcommand( "edm" , Commands.music.sub.edm.fn , Commands.music.sub.edm.config );
			musicCommand.registerSubcommand( "relax" , Commands.music.sub.relax.fn , Commands.music.sub.relax.config );
			// ========================================================================================
			// Common State Names======================================================================


			// Youtube
			// ========================================================================================
			// ========================================================================================
				var youtubeCommand = discordBot.registerCommand( "youtube" , ( msg , args ) => {
					if( args.length === 0 ) {
						// Start Currated As Default
						require( "./clientManager.js" ).pressButtonMaster( "15" );
						return;
					}
					var final_options = { position: "FOREGROUND" };
					if ( args[ 0].indexOf( "watch?v=" ) !== -1 ) {
						final_options.mode = "SINGLE";
						final_options.single_id = args[ 0 ].split( "watch?v=" )[ 1 ];
					}
					else if ( args[ 0 ].indexOf( "playlist?list=" ) !== -1 ) {
						final_options.mode = "PLAYLIST_OFFICIAL";
						final_options.playlist_id = args[ 0 ].split( "playlist?list=" )[ 1 ];
					}
					else if ( args[ 0 ].indexOf( "youtu.be/" ) !== -1 ) {
						final_options.mode = "SINGLE";
						final_options.single_id = args[ 0 ].split( "youtu.be/" )[ 1 ];
					}
					else {
						if ( args[ 0 ].length > 15 ) {
							final_options.mode = "PLAYLIST_OFFICIAL";
							final_options.playlist_id = args[ 0 ];
						}
						else {
							final_options.mode = "SINGLE";
							final_options.single_id = args[ 0 ];
						}
					}
					require( "./clientManager.js" ).pressButtonMaster( "17" , final_options );
					return;
				}, {
					description: "Start Youtube State",
					fullDescription: "Start Youtube State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "yt" , "youtube" );

				youtubeCommand.registerSubcommand( "followers" , async ( msg , args ) => {
					if( args.length === 0 ) {
						const followers = await require( "./YOUTUBE/youtubeAPI_Utils.js" ).getFollowers();
						if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
						return "failed";
					}
					return;
				}, {
					description: "Get Youtube Followers",
					fullDescription: "Get Youtube Followers",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "follow" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "No Username Sent";
					}
					return;
				}, {
					description: "Follow YouTube Channel",
					fullDescription: "Follow YouTube Channel",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "unfollow" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "No Username Sent";
					}
					return;
				}, {
					description: "Unfollow YouTube Channel",
					fullDescription: "Unfollow YouTube Channel",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "unblacklist" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "No Video Sent";
					}
					return "Not Setup";
				}, {
					description: "UnBlacklist YouTube Video",
					fullDescription: "UnBlacklist YouTube Video",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "blacklist" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "No Video Sent";
					}
					return "Not Setup";
				}, {
					description: "Blacklist YouTube Video",
					fullDescription: "Blacklist YouTube Video",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "import" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "try: !yt import <currated,relax> <video_id,playlist_id>";
					}
					if ( args[ 0 ] === "currated" ) {
						if ( args[ 1 ] ===  "playlist" ) {
							await require( "./YOUTUBE/currated.js" ).importFromPlaylistID( args[ 2 ] );;
						}
						else {
							for ( var i = 1; i < args.length; ++i ) {
								await require( "./YOUTUBE/currated.js" ).addToQue( args[ i ] );
							}
						}
					}
					else if ( args[ 0 ] === "relax" || args[ 0 ] === "relaxing" ) {
						if ( args[ 1 ] ===  "playlist" ) {
							await require( "./YOUTUBE/relax.js" ).importFromPlaylistID( args[ 2 ] );
						}
						else {
							for ( var i = 1; i < args.length; ++i ) {
								await require( "./YOUTUBE/relax.js" ).addToQue( args[ i ] );
							}
						}
					}
					return;
				}, {
					description: "Import Stuff to Local DB",
					fullDescription: "Import Stuff to Local DB",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				youtubeCommand.registerSubcommandAlias( "add" , "import" );

				youtubeCommand.registerSubcommand( "info" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "try: !yt import <currated,relax> <video_id,playlist_id>";
					}
					if ( args[ 1 ] === "standard" ) {
						if ( args[ 2 ] ) {
							const wVideo = await require( "./YOUTUBE/standard.js" ).getVideoInfo( args[ 2 ] )
							return "YouTube Video Info: [ " + args[ 2 ] + " ]: \n" +
								"\ttitle == " + wVideo[ "title" ] + "\n" +
								"\tpubdate == " + wVideo[ "pubdate" ] + "\n" +
								"\tcompleted == " + wVideo[ "completed" ] + "\n" +
								"\tskipped == " + wVideo[ "skipped" ] + "\n" +
								"\tcurrent_time == " + wVideo[ "current_time" ] + "\n" +
								"\tremaining_time == " + wVideo[ "remaining_time" ] + "\n" +
								"\tduration == " + wVideo[ "duration" ] + "\n";
						}
					}
					return;
				}, {
					description: "Get Video Info",
					fullDescription: "Get Video Info",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "que" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "try: !yt que <standard,currated,relax>";
					}
					const manager_path = "./YOUTUBE/" + args[ 0 ] + ".js";
					const que = await require( manager_path ).getQue();
					if ( que ) {
						if ( que.length > 0 ) {
							return( "YouTube '" + args[ 0 ] + "' Que: \n" + que.join( " , " ) );
						}
					}
					return "Empty";
				}, {
					description: "Get Youtube Section Que",
					fullDescription: "Get Youtube Section Que",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "live" , async ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "0" );
					}
					return;
				}, {
					description: "Start Youtube Live State",
					fullDescription: "Start Youtube Live State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				youtubeCommand.registerSubcommandAlias( "background" , "live" );

				youtubeCommand.registerSubcommand( "standard" , async ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "14" );
					}
					return;
				}, {
					description: "Start Youtube Standard State",
					fullDescription: "Start Youtube Standard State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "currated" , async ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "15" );
					}
					return;
				}, {
					description: "Start Youtube Currated State",
					fullDescription: "Start Youtube Currated State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "relax" , async ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "16" );
					}
					return;
				}, {
					description: "Start Youtube Relaxing State",
					fullDescription: "Start Youtube Relaxing State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				youtubeCommand.registerSubcommandAlias( "relaxing" , "relax" );
			// ========================================================================================
			// Youtube=================================================================================

			// Twitch
			// ========================================================================================
			// ========================================================================================
				var twitchCommand = discordBot.registerCommand( "twitch" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "3" );
					}
					return;
				}, {
					description: "Start Twitch State",
					fullDescription: "Start Twitch State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "follow" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "Invalid input";
					}
					await require( "./utils/twitchAPI_Utils.js" ).followUserName( args[ 0 ] );
					const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
					if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
					return;
				}, {
					description: "Follow Twitch User",
					fullDescription: "Follow Twitch User",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "unfollow" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "Invalid input";
					}
					await require( "./utils/twitchAPI_Utils.js" ).unfollowUserName( args[ 0 ] );
					const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
					if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
					return;
				}, {
					description: "Follow Twitch User",
					fullDescription: "Follow Twitch User",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "live" , async ( msg , args ) => {
					const live_twitch = await require( "./utils/twitchAPI_Utils.js" ).getLiveUsers();
					if ( live_twitch ) { if ( live_twitch.length > 0 ) { return live_twitch.join( " , " ); } }
					return "None";
				}, {
					description: "Get Live Twitch Followers",
					fullDescription: "Get Live Twitch Followers",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "followers" , async ( msg , args ) => {
					const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
					if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
					return "None";
				}, {
					description: "Get Twitch Followers",
					fullDescription: "Get Twitch Followers",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				twitchCommand.registerSubcommandAlias( "following" , "followers" );
			// ========================================================================================
			// Twitch==================================================================================


			// Misc
			// ========================================================================================
			// ========================================================================================
				var optionsCommand = discordBot.registerCommand( "options" , ( msg , args ) => {
					if( args.length === 0 ) {
						return GetButtonInfo();
					}
				}, {
					description: "Get Available States" ,
					fullDescription: "Get Available States" ,
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "cmds" , "options" );
				discordBot.registerCommandAlias( "commands" , "options" );

				var execCommand = discordBot.registerCommand( "exec" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return;
					}
					const cmd = args.join(" ");
					const output = await require( "./utils/generic.js" ).osCommand( cmd );
					return output;
				}, {
					description: "Run Command on OS",
					fullDescription: "Run Command on OS",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "run" , "exec" );
				discordBot.registerCommandAlias( "os" , "exec" );

				var restartCommand = discordBot.registerCommand( "restart" , async ( msg , args ) => {
					if( args.length === 0 ) {
						const output = await require( "./utils/generic.js" ).osCommand( "pm2 restart all" );
						if ( output ) {
							return output;
						}
					}
					return;
				}, {
					description: "Restart PM2 App",
					fullDescription: "Restart PM2 App",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				var timeCommand = discordBot.registerCommand( "time" , ( msg , args ) => {
					return require( "./utils/generic.js" ).time();
				}, {
				description: "Get Current Server Time",
					fullDescription: "Get Current Server Time",
					usage: "<text>"
				});

				var tvPowerCommand = discordBot.registerCommand( "tvpower" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./utils/cecClientManager.js" ).activate();
					}
					return;
				}, {
					description: "Push TV Power Button",
					fullDescription: "Push TV Power Button",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "tv" , "tvpower" );

				var urlFullScreenCommand = discordBot.registerCommand( "url" , ( msg , args ) => {
					if( args.length === 1 ) {
						require( "./utils/generic.js" ).osCommand( "sudo pkill -9 firefox" );
						const url = args.join(" ");
						console.log( "Opening URL --> " + url );
						require( "./utils/generic.js" ).osCommand( "/usr/local/bin/openURLFullScreen " + url );
					}
					return;
				}, {
					description: "Open URL Full Screen",
					fullDescription: "Open URL Full Screen",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
			//========================================================================================
			//Misc====================================================================================
			await discordBot.connect();
			await Sleep( 2000 );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;