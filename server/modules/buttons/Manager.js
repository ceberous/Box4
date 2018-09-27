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

// https://www.amazon.com/Black-Acrylic-Panel-Replacement-Arcade/dp/B075894V5M/
// https://www.amazon.com/gp/product/B01MRWL6DW
// https://www.amazon.com/gp/product/B00XHRIKLE
// https://www.instructables.com/id/Make-Custom-Labels-for-Happ-Pushbuttons/