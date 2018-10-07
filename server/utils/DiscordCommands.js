const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const PB_FP = path.join( MainFP , "server" , "StateManager.js" );
const YoutubeAPIUtils_FP = path.join( MainFP , "server" , "modules" , "youtube" , "API.js" );
const YoutubeStandard_FP = path.join( MainFP , "server" , "modules" , "youtube" , "Standard.js" );
const YoutubeCurrated_FP = path.join( MainFP , "server" , "modules" , "youtube" , "Currated.js" );
const YoutubeLive_FP = path.join( MainFP , "server" , "modules" , "youtube" , "Live.js" );
const YoutubeRelax_FP = path.join( MainFP , "server" , "modules" , "youtube" , "Relax.js" );
const TwitchAPIUtils_FP = path.join( MainFP , "server" , "modules" , "twitch" , "API.js" );
const GenericUtils_FP = path.join( MainFP , "server" , "utils" , "Generic.js" );
const CEC_Manager_FP = path.join( MainFP , "server" , "utils" , "CEC_USB.js" );

function GetButtonInfo() {
	const ButtonInfo = require( path.join( MainFP , "main.js" ) ).config.buttons;
	var reply_string = "";
	for ( var state in ButtonInfo ) {
		reply_string = reply_string + "!btn " + state + " === " + ButtonInfo[ state ][ "name" ] + "\n";
	}
	return reply_string;
}

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
const YoutubeCommands = {
	youtube: {
		alias: [ "yt" ] ,
		config: {
			description: "Start Youtube State",
			fullDescription: "Start Youtube State",
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			if( args.length === 0 ) {
				// Start Currated As Default
				require( PB_FP ).pressButtonMaster( "15" );
				return;
			}
			if ( args[ 0 ].indexOf( "watch?v=" ) !== -1 ) {
				// Single ID Video
				require( PB_FP ).pressButtonMaster( "17" , args[ 0 ].split( "watch?v=" )[ 1 ] );
				return;
			}
			else if ( args[ 0 ].indexOf( "playlist?list=" ) !== -1 ) {
				// Official Playlist
				require( PB_FP ).pressButtonMaster( "19" , args[ 0 ].split( "playlist?list=" )[ 1 ] );
				return;
			}
			else if ( args[ 0 ].indexOf( "youtu.be/" ) !== -1 ) {
				// Single ID Video , Other Option
				require( PB_FP ).pressButtonMaster( "17" ,  args[ 0 ].split( "youtu.be/" )[ 1 ] );
				return;
			}
			else {
				if ( args[ 0 ].length > 15 ) {
					// Official Playlist
					require( PB_FP ).pressButtonMaster( "19" , args[ 0 ] );
					return;
				}
				else {
					// Single ID Video , Other Option
					require( PB_FP ).pressButtonMaster( "17" ,  args[ 0 ] );
					return;
				}
			}
			return;
		} ,
		sub: {
			followers: {
				config: {
					description: "Get Youtube Followers",
					fullDescription: "Get Youtube Followers",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: async function( msg , args ) {
					if( args.length === 0 ) {
						const followers = await require( YoutubeAPIUtils_FP ).getFollowers();
						if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
						return "failed";
					}
					return;
				}
			} ,
			follow: {
				config: {
					description: "Follow YouTube Channel",
					fullDescription: "Follow YouTube Channel",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: function( msg , args ) {
					if( args.length === 0 ) {
						return "No Username Sent";
					}
					return;
				}
			} ,
			unfollow: {
				config: {
					description: "UnFollow YouTube Channel",
					fullDescription: "UnFollow YouTube Channel",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: function( msg , args ) {
					if( args.length === 0 ) {
						return "No Username Sent";
					}
					return;
				}
			} ,
			unblacklist: {
				config: {
					description: "UnBlacklist YouTube Video",
					fullDescription: "UnBlacklist YouTube Video",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: function( msg , args ) {
					if( args.length === 0 ) {
						return "No Username Sent";
					}
					return;
				}
			} ,
			blacklist: {
				config: {
					description: "Blacklist YouTube Video",
					fullDescription: "Blacklist YouTube Video",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: function( msg , args ) {
					if( args.length === 0 ) {
						return "No Username Sent";
					}
					return;
				}
			} ,
			import: {
				alias: [ "add" ] ,
				config: {
					description: "Import YouTube Stuff to Local DB",
					fullDescription: "Import YouTube Stuff to Local DB",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: async function( msg , args ) {
					if( args.length === 0 ) {
						return "try: !yt import <currated,relax> <video_id,playlist_id>";
					}
					if ( args[ 0 ] === "currated" ) {
						if ( args[ 1 ] ===  "playlist" ) {
							await require( YoutubeCurrated_FP ).importFromPlaylistID( args[ 2 ] );;
						}
						else {
							for ( var i = 1; i < args.length; ++i ) {
								await require( YoutubeCurrated_FP ).addToQue( args[ i ] );
							}
						}
					}
					else if ( args[ 0 ] === "relax" || args[ 0 ] === "relaxing" ) {
						if ( args[ 1 ] ===  "playlist" ) {
							await require( YoutubeRelax_FP ).importFromPlaylistID( args[ 2 ] );
						}
						else {
							for ( var i = 1; i < args.length; ++i ) {
								await require( YoutubeRelax_FP ).addToQue( args[ i ] );
							}
						}
					}
					return;
				}
			} ,
			info: {
				config: {
					description: "Get Video Info",
					fullDescription: "Get Video Info",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: async function( msg , args ) {
					if( args.length === 0 ) {
						return "try: !yt import <currated,relax> <video_id,playlist_id>";
					}
					if ( args[ 1 ] === "standard" ) {
						if ( args[ 2 ] ) {
							const wVideo = await require( YoutubeStandard_FP ).getVideoInfo( args[ 2 ] )
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
				}
			} ,
			que: {
				config: {
					description: "Get Youtube Section Que",
					fullDescription: "Get Youtube Section Que",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: async function( msg , args ) {
					if( args.length === 0 ) {
						return "try: !yt que <standard,currated,relax>";
					}
					let manager_path;
					switch( args[ 0 ] ) {
						case "standard":
							manager_path = YoutubeStandard_FP;
							break;
						case "currated":
							manager_path = YoutubeCurrated_FP;
							break;
						case "relax":
							manager_path = YoutubeRelax_FP;
							break;
						default:
							manager_path = YoutubeCurrated_FP;
							break;
					}
					const que = await require( manager_path ).getQue();
					if ( que ) {
						if ( que.length > 0 ) {
							return( "YouTube '" + args[ 0 ] + "' Que: \n" + que.join( " , " ) );
						}
					}
					return "Empty";
				}
			} ,
			live: {
				alias: [ "background" ] ,
				config: {
					description: "Start Youtube Live State",
					fullDescription: "Start Youtube Live State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: function( msg , args ) {
					if( args.length === 0 ) {
						require( PB_FP ).pressButtonMaster( "0" );
					}
					return;
				}
			} ,
			standard: {
				config: {
					description: "Start Youtube Standard State",
					fullDescription: "Start Youtube Standard State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: function( msg , args ) {
					if( args.length === 0 ) {
						require( PB_FP ).pressButtonMaster( "14" );
					}
					return;
				}
			} ,
			currated: {
				config: {
					description: "Start Youtube Currated State",
					fullDescription: "Start Youtube Currated State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: function( msg , args ) {
					if( args.length === 0 ) {
						require( PB_FP ).pressButtonMaster( "15" );
					}
					return;
				}
			} ,
			relax: {
				alias: [ "relaxing" ] ,
				config: {
					description: "Start Youtube Relaxing State",
					fullDescription: "Start Youtube Relaxing State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: function( msg , args ) {
					if( args.length === 0 ) {
						require( PB_FP ).pressButtonMaster( "16" );
					}
					return;
				}
			} ,
		}
	} ,
};
// ========================================================================================
// Youtube=================================================================================

// Twitch
// ========================================================================================
// ========================================================================================
const TwitchCommands = {
	twitch: {
		config: {
			description: "Start Twitch State",
			fullDescription: "Start Twitch State",
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			if( args.length === 0 ) {
				require( PB_FP ).pressButtonMaster( "3" );
			}
			return;
		} ,
		sub: {
			follow: {
				config: {
					description: "Follow Twitch User",
					fullDescription: "Follow Twitch User",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: async function( msg , args ) {
					if( args.length === 0 ) {
						return "Invalid input";
					}
					await require( TwitchAPIUtils_FP ).followUserName( args[ 0 ] );
					const followers = await require( TwitchAPIUtils_FP ).getFollowers();
					if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
					return;
				}
			} ,
			unfollow: {
				config: {
					description: "UnFollow Twitch User",
					fullDescription: "UnFollow Twitch User",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: async function( msg , args ) {
					if( args.length === 0 ) {
						return "Invalid input";
					}
					await require( TwitchAPIUtils_FP ).unfollowUserName( args[ 0 ] );
					const followers = await require( TwitchAPIUtils_FP ).getFollowers();
					if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
					return;
				}
			} ,
			live: {
				config: {
					description: "Get Live Twitch Followers",
					fullDescription: "Get Live Twitch Followers",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: async function( msg , args ) {
					const live_twitch = await require( TwitchAPIUtils_FP ).getLiveUsers();
					if ( live_twitch ) { if ( live_twitch.length > 0 ) { return live_twitch.join( " , " ); } }
					return "None";
				}
			} ,
			followers: {
				alias: [ "following" ] ,
				config: {
					description: "Get Twitch Followers",
					fullDescription: "Get Twitch Followers",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				} ,
				fn: async function( msg , args ) {
					const followers = await require( TwitchAPIUtils_FP ).getFollowers();
					if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
					return "None";
				}
			} ,
		}
	}
};
// ========================================================================================
// Twitch==================================================================================

// Misc
// ========================================================================================
// ========================================================================================
const MiscCommands = {
	options: {
		alias: [ "cmds" , "commands" ] ,
		config: {
			description: "Get Available States" ,
			fullDescription: "Get Available States" ,
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			if( args.length === 0 ) {
				return GetButtonInfo();
			}
		}
	} ,
	exec: {
		alias: [ "run" , "os" ] ,
		config: {
			description: "Run Command on OS",
			fullDescription: "Run Command on OS",
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: async function( msg , args ) {
			if( args.length === 0 ) {
				return;
			}
			const cmd = args.join(" ");
			const output = await require( GenericUtils_FP ).osCommand( cmd );
			return output;
		}
	} ,
	restart: {
		config: {
			description: "Run PM2 App",
			fullDescription: "Run PM2 App",
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: async function( msg , args ) {
			if( args.length === 0 ) {
				const output = await require( GenericUtils_FP ).osCommand( "pm2 restart all" );
				if ( output ) {
					return output;
				}
			}
			return;
		}
	} ,
	time: {
		config: {
			description: "Get Current Server Time",
			fullDescription: "Get Current Server Time",
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			return require( GenericUtils_FP ).time();
		}
	} ,
	tvpower: {
		alias: [ "tv" ] ,
		config: {
			description: "Push TV Power Button",
			fullDescription: "Push TV Power Button",
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			if( args.length === 0 ) {
				require( CEC_Manager_FP ).activate();
			}
			return;
		}
	} ,
	url: {
		config: {
			description: "Open URL Full Screen",
			fullDescription: "Open URL Full Screen",
			usage: "<text>" ,
			reactionButtonTimeout: 0
		} ,
		fn: function( msg , args ) {
			if( args.length === 1 ) {
				require( GenericUtils_FP ).osCommand( "sudo pkill -9 firefox" );
				const url = args.join(" ");
				console.log( "Opening URL --> " + url );
				require( GenericUtils_FP ).osCommand( "/usr/local/bin/openURLFullScreen " + url );
			}
			return;
		}
	} ,
};
//========================================================================================
//Misc====================================================================================

module.exports = {
	buttons: ButtonCommands ,
	states: StateCommands ,
	youtube: YoutubeCommands ,
	twitch: TwitchCommands ,
	misc: MiscCommands ,
};