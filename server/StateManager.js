const path	= require( "path" );
const CLogPrefix = "[STATE_MAN] --> ";
const CLogColorConfig = [ "black" , "bgWhite" ];
const CLog = require( "./utils/Generic.js" ).clog;
function CLog1( wSTR ) { CLog( wSTR , CLogColorConfig , CLogPrefix ); }


const Sleep = require( "./utils/Generic.js" ).sleep;
const Redis = require( "../main.js" ).redis;
const Reporter = require( "../main.js" ).reporter;

var cached_launching_fp = null;
var cached_mode = null;
var CURRENT_STATE = null;
const BTN_MAP = require( "../main.js" ).config.buttons;

async function wPressButtonMaster( wButtonNum , wOptions , wMasterClose ) {
	CLog1( "wPressButtonMaster( " + wButtonNum.toString() + " )" );
	if ( wBTN_I > 20 || wBTN_I < 0 ) { return "out of range"; }
	wOptions = wOptions || BTN_MAP[ wButtonNum ][ "options" ];
	wSendButtonPressNotification( wButtonNum );
	var wBTN_I = parseInt( wButtonNum );
	if ( wBTN_I === 6 ) {
		if ( CURRENT_STATE ) {
			if ( CURRENT_STATE !== null ) {
				CLog1( "stopping CURRENT_STATE" ); 
				await CURRENT_STATE.stop();
				try { delete require.cache[ CURRENT_STATE ]; }
				catch ( e ) {}			
				CURRENT_STATE = null;
				await wSleep( 500 );
			}
		}
		if ( wMasterClose ) { await require( "./utils/Generic.js" ).closeEverything(); }
		else { await require( "./utils/Generic.js" ).closeCommon(); }
		return;
	}
	var launching_fp = null;
	var launching_state_name = null;
	if ( BTN_MAP[ wButtonNum ][ "state" ] || BTN_MAP[ wButtonNum ][ "session" ] ) {
		if ( BTN_MAP[ wButtonNum ][ "session" ] ) {
			launching_fp = path.join( __dirname , "SESSIONS" ,  BTN_MAP[ wButtonNum ][ "session" ] + ".js" );
			launching_state_name = BTN_MAP[ wButtonNum ][ "session" ];
			CLog1( "LAUNCHING SESSION ---> " + BTN_MAP[ wButtonNum ][ "session" ] );
		}
		else {
			launching_fp = path.join( __dirname , "STATES" ,  BTN_MAP[ wButtonNum ][ "state" ] + ".js" );
			launching_state_name = BTN_MAP[ wButtonNum ][ "state" ];
			CLog1( "LAUNCHING STATE ---> " + BTN_MAP[ wButtonNum ][ "state" ] );
		}
		if ( launching_fp === cached_launching_fp ) {
			if ( wOptions ) {
				if ( wOptions.mode ) {
					if ( wOptions.mode === cached_mode ) { return; }
				}
				else { return; }
			}
			else { return; }
		}
		if ( CURRENT_STATE ) {
			if ( CURRENT_STATE !== null ) {
				CLog1( "stopping CURRENT_STATE --> " + CURRENT_STATE );
				await CURRENT_STATE.stop(); 
				await wSleep( 1000 );
			}
		}
		
		require( "./utils/cecClientManager.js" ).activate();	
		try { delete require.cache[ CURRENT_STATE ]; }
		catch ( e ) {}
		CURRENT_STATE = null;
		await wSleep( 1000 );
		CURRENT_STATE = require( launching_fp );
		cached_launching_fp = launching_fp;
		if ( wOptions.mode ) { cached_mode = wOptions.mode; }
		//RU.setKey(  )
		await CURRENT_STATE.start( wOptions );
	}
	else { if ( CURRENT_STATE ) { CLog1( "STATE ACTION --> " + BTN_MAP[ wButtonNum ][ "label" ] + "()" ); CURRENT_STATE[ BTN_MAP[ wButtonNum ][ "label" ] ](); } }
}
module.exports.pressButtonMaster = wPressButtonMaster;



// MODULES
// ======================================================================
// ======================================================================
const BTN_MAN 			= require( ".//modules/buttons/Manager.js" );
const MOPIDY_MAN 		= require( "./modules/mopidy/Manager.js" );
//const SCHEDULE_MAN 		= require( "./scheduleManager.js" );
// ======================================================================
// ======================================================================

( async ()=> {
	CLog1( "Initializing stuff" );
	await require( "./modules/localmedia/Manager.js" ).initialize();
	await require( "./modules/youtube/Standard.js" ).update();
	CLog1( "we are done with Initialization" );
	await require( "./utils/Generic.js" ).getStatusReport();
})();