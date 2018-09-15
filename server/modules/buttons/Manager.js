const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const path = require( "path" );

const CLogPrefix = "[LOCAL_MEDIA_MAN] --> ";
const CLogColorConfig = [ "magenta" , "bgBlack" ];
const CLog = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).clog;
function CLog1( wSTR ) { CLog( wSTR , CLogColorConfig , CLogPrefix ); }
const Emitter	= require( path.join( MainFP , "main.js" ) ).emitter;
const Sleep = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).sleep;
const UpdateLastPlayedTime = require( path.join( MainFP , "server" , "modules" , "localmedia" , "utils" , "Generic.js" ) ).updateLastPlayedTime;

const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const MPLAYER_MAN = require( path.join( MainFP , "server" , "modules" , "mplayer" , "Manager.js" ) );


var G_NOW_PLAYING = G_R_Live_Genre_NP = G_R_NP_ShowName_Backup = null;