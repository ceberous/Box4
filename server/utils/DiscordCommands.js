const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const PB_FP = path.join( MainFP , "server" , "StateManager.js" );

// module.exports.buttonsCommand = function( msg , args ) {
// 	if( args.length === 0 ) {
// 		PressButton( "3" );
// 	}
// 	return;
// };



// Buttons
// ========================================================================================
// ========================================================================================
const ButtonCommands = {
	stop: {
		alias: [ "quit" ] ,
		config: {
			description: "Stop" ,
			fullDescription: "Stop" ,
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			require( PB_FP ).pressButtonMaster( "6" );
			return;
		}
	} ,
	pause: {
		config: {
			description: "Pause" ,
			fullDescription: "Pause" ,
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			require( PB_FP ).pressButtonMaster( "7" );
			return;
		}
	} ,
	previous: {
		config: {
			description: "Previous" ,
			fullDescription: "Previous" ,
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			require( PB_FP ).pressButtonMaster( "8" );
			return;
		}
	} ,
	next: {
		config: {
			description: "Next" ,
			fullDescription: "Next" ,
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			require( PB_FP ).pressButtonMaster( "9" );
			return;
		}
	}
};
// ========================================================================================
// Buttons=================================================================================


// Common State Names
// ========================================================================================
// ========================================================================================
const StateCommands = {
	relax: {
		alias: [ "relaxing" ] ,
		config: {
			description: "Relaxing Youtube Videos" ,
			fullDescription: "Relaxing Youtube Videos" ,
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			require( PB_FP ).pressButtonMaster( "16" );
			return;
		}
	} ,
	odyssey: {
		alias: [ "od" , "aio" ] ,
		config: {
			description: "Start Adventures in Odyseey with YT Live Background" ,
			fullDescription: "Start Adventures in Odyseey with YT Live Background" ,
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			require( PB_FP ).pressButtonMaster( "11" );
			return;
		}
	} ,
	music: {
		alias: [ "mopidy" ] ,
		config: {
			description: "Play Mopidy Standard Music" ,
			fullDescription: "Play Mopidy Standard Music" ,
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			require( PB_FP ).pressButtonMaster( "1" );
			return;
		} ,
		sub: {
			edm: {
				config: {
					description: "Play Mopidy EDM Music" ,
					fullDescription: "Play Mopidy EDM Music" ,
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: function( msg , args ) {
					require( PB_FP ).pressButtonMaster( "2" );
					return;
				}
			} ,
			relax: {
				config: {
					description: "Play Mopidy Relaxing Music" ,
					fullDescription: "Play Mopidy Relaxing Music" ,
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: function( msg , args ) {
					//require( PB_FP ).pressButtonMaster( "2" );
					return "Not Yet Implamented";
				}
			} ,
		}
	}
};
// ========================================================================================
// Common State Names======================================================================



// Youtube
// ========================================================================================
// ========================================================================================
// var youtubeCommand = discordBot.registerCommand( "youtube" , ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		// Start Currated As Default
// 		require( "./clientManager.js" ).pressButtonMaster( "15" );
// 		return;
// 	}
// 	var final_options = { position: "FOREGROUND" };
// 	if ( args[ 0].indexOf( "watch?v=" ) !== -1 ) {
// 		final_options.mode = "SINGLE";
// 		final_options.single_id = args[ 0 ].split( "watch?v=" )[ 1 ];
// 	}
// 	else if ( args[ 0 ].indexOf( "playlist?list=" ) !== -1 ) {
// 		final_options.mode = "PLAYLIST_OFFICIAL";
// 		final_options.playlist_id = args[ 0 ].split( "playlist?list=" )[ 1 ];
// 	}
// 	else if ( args[ 0 ].indexOf( "youtu.be/" ) !== -1 ) {
// 		final_options.mode = "SINGLE";
// 		final_options.single_id = args[ 0 ].split( "youtu.be/" )[ 1 ];
// 	}
// 	else {
// 		if ( args[ 0 ].length > 15 ) {
// 			final_options.mode = "PLAYLIST_OFFICIAL";
// 			final_options.playlist_id = args[ 0 ];
// 		}
// 		else {
// 			final_options.mode = "SINGLE";
// 			final_options.single_id = args[ 0 ];
// 		}
// 	}
// 	require( "./clientManager.js" ).pressButtonMaster( "17" , final_options );
// 	return;
// }, {
// 	description: "Start Youtube State",
// 	fullDescription: "Start Youtube State",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });
// discordBot.registerCommandAlias( "yt" , "youtube" );

// youtubeCommand.registerSubcommand( "followers" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		const followers = await require( "./YOUTUBE/youtubeAPI_Utils.js" ).getFollowers();
// 		if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
// 		return "failed";
// 	}
// 	return;
// }, {
// 	description: "Get Youtube Followers",
// 	fullDescription: "Get Youtube Followers",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });

// youtubeCommand.registerSubcommand( "follow" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		return "No Username Sent";
// 	}
// 	return;
// }, {
// 	description: "Follow YouTube Channel",
// 	fullDescription: "Follow YouTube Channel",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });

// youtubeCommand.registerSubcommand( "unfollow" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		return "No Username Sent";
// 	}
// 	return;
// }, {
// 	description: "Unfollow YouTube Channel",
// 	fullDescription: "Unfollow YouTube Channel",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });

// youtubeCommand.registerSubcommand( "unblacklist" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		return "No Video Sent";
// 	}
// 	return "Not Setup";
// }, {
// 	description: "UnBlacklist YouTube Video",
// 	fullDescription: "UnBlacklist YouTube Video",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });

// youtubeCommand.registerSubcommand( "blacklist" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		return "No Video Sent";
// 	}
// 	return "Not Setup";
// }, {
// 	description: "Blacklist YouTube Video",
// 	fullDescription: "Blacklist YouTube Video",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });

// youtubeCommand.registerSubcommand( "import" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		return "try: !yt import <currated,relax> <video_id,playlist_id>";
// 	}
// 	if ( args[ 0 ] === "currated" ) {
// 		if ( args[ 1 ] ===  "playlist" ) {
// 			await require( "./YOUTUBE/currated.js" ).importFromPlaylistID( args[ 2 ] );;
// 		}
// 		else {
// 			for ( var i = 1; i < args.length; ++i ) {
// 				await require( "./YOUTUBE/currated.js" ).addToQue( args[ i ] );
// 			}
// 		}
// 	}
// 	else if ( args[ 0 ] === "relax" || args[ 0 ] === "relaxing" ) {
// 		if ( args[ 1 ] ===  "playlist" ) {
// 			await require( "./YOUTUBE/relax.js" ).importFromPlaylistID( args[ 2 ] );
// 		}
// 		else {
// 			for ( var i = 1; i < args.length; ++i ) {
// 				await require( "./YOUTUBE/relax.js" ).addToQue( args[ i ] );
// 			}
// 		}
// 	}
// 	return;
// }, {
// 	description: "Import Stuff to Local DB",
// 	fullDescription: "Import Stuff to Local DB",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });
// youtubeCommand.registerSubcommandAlias( "add" , "import" );

// youtubeCommand.registerSubcommand( "info" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		return "try: !yt import <currated,relax> <video_id,playlist_id>";
// 	}
// 	if ( args[ 1 ] === "standard" ) {
// 		if ( args[ 2 ] ) {
// 			const wVideo = await require( "./YOUTUBE/standard.js" ).getVideoInfo( args[ 2 ] )
// 			return "YouTube Video Info: [ " + args[ 2 ] + " ]: \n" +
// 				"\ttitle == " + wVideo[ "title" ] + "\n" +
// 				"\tpubdate == " + wVideo[ "pubdate" ] + "\n" +
// 				"\tcompleted == " + wVideo[ "completed" ] + "\n" +
// 				"\tskipped == " + wVideo[ "skipped" ] + "\n" +
// 				"\tcurrent_time == " + wVideo[ "current_time" ] + "\n" +
// 				"\tremaining_time == " + wVideo[ "remaining_time" ] + "\n" +
// 				"\tduration == " + wVideo[ "duration" ] + "\n";
// 		}
// 	}
// 	return;
// }, {
// 	description: "Get Video Info",
// 	fullDescription: "Get Video Info",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });

// youtubeCommand.registerSubcommand( "que" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		return "try: !yt que <standard,currated,relax>";
// 	}
// 	const manager_path = "./YOUTUBE/" + args[ 0 ] + ".js";
// 	const que = await require( manager_path ).getQue();
// 	if ( que ) {
// 		if ( que.length > 0 ) {
// 			return( "YouTube '" + args[ 0 ] + "' Que: \n" + que.join( " , " ) );
// 		}
// 	}
// 	return "Empty";
// }, {
// 	description: "Get Youtube Section Que",
// 	fullDescription: "Get Youtube Section Que",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });

// youtubeCommand.registerSubcommand( "live" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		require( "./clientManager.js" ).pressButtonMaster( "0" );
// 	}
// 	return;
// }, {
// 	description: "Start Youtube Live State",
// 	fullDescription: "Start Youtube Live State",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });
// youtubeCommand.registerSubcommandAlias( "background" , "live" );

// youtubeCommand.registerSubcommand( "standard" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		require( "./clientManager.js" ).pressButtonMaster( "14" );
// 	}
// 	return;
// }, {
// 	description: "Start Youtube Standard State",
// 	fullDescription: "Start Youtube Standard State",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });

// youtubeCommand.registerSubcommand( "currated" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		require( "./clientManager.js" ).pressButtonMaster( "15" );
// 	}
// 	return;
// }, {
// 	description: "Start Youtube Currated State",
// 	fullDescription: "Start Youtube Currated State",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });

// youtubeCommand.registerSubcommand( "relax" , async ( msg , args ) => {
// 	if( args.length === 0 ) {
// 		require( "./clientManager.js" ).pressButtonMaster( "16" );
// 	}
// 	return;
// }, {
// 	description: "Start Youtube Relaxing State",
// 	fullDescription: "Start Youtube Relaxing State",
// 	usage: "<text>" ,
// 	reactionButtonTimeout: 0
// });
// youtubeCommand.registerSubcommandAlias( "relaxing" , "relax" );
// ========================================================================================
// Youtube=================================================================================


module.exports = {
	buttons: ButtonCommands ,
	states: StateCommands ,
	//youtube: YoutubeCommands ,
	//twitch: TwitchCommands ,
};