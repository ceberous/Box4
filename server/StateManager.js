const path	= require( "path" );

const Sleep = require( "./utils/Generic.js" ).sleep;
const Redis = require( "../main.js" ).redis;
const RC = Redis.c.LAST_SS;
const Reporter = require(  "./utils/Reporter.js" );

const BTN_MAP = require( "../main.js" ).config.buttons;

var CURRENT_STATE = null;
var CURRENT_STATE_BUTTON = 0;
var CURRENT_STATE_FP = null;
var CURRENT_STATE_MODE = null;
var CURRENT_STATE_NAME = null;
var CURRENT_STATE_OPTIONS = null;
function CURRENT_STATE_STOP() {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( CURRENT_STATE !== null ) {
				Reporter.log( "stopping CURRENT_STATE --> " + CURRENT_STATE_NAME );
				await CURRENT_STATE.stop();
				await Sleep( 1000 );
				try { delete require.cache[ CURRENT_STATE ]; }
				catch ( e ) {}
				CURRENT_STATE = null;
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

async function PRESS_BUTTON( wButtonNum , wOptions , wMasterClose ) {

	Reporter.log( "PRESS_BUTTON( " + wButtonNum.toString() + " )" );
	const wBTN_I = parseInt( wButtonNum );
	if ( wBTN_I > 22 || wBTN_I < 0 ) { return "out of range"; }
	wOptions = wOptions || BTN_MAP[ wButtonNum ][ "options" ];

	// If Closing Command
	if ( wBTN_I === 6 ) {
		await CURRENT_STATE_STOP();
		if ( wMasterClose ) { await require( "./utils/Generic.js" ).closeEverything(); }
		else { await require( "./utils/Generic.js" ).closeCommon(); }
		return;
	}
	// Else If, State Action Label , i.e pause , next , exct
	else if ( wBTN_I === 7 || wBTN_I === 8 || wBTN_I === 9 ) {
		// Only If , Current State is Active
		if ( CURRENT_STATE ) {
			Reporter.log( "STATE ACTION --> " + BTN_MAP[ wButtonNum ][ "label" ] + "()" );
			CURRENT_STATE[ BTN_MAP[ wButtonNum ][ "label" ] ]();
		}
		return;
	}

	// Else , Button Number indicates new state or session, Launch State or Session By Number
	let launching_fp = BTN_MAP[ wButtonNum ].fp;
	CURRENT_STATE_BUTTON = wButtonNum;
	CURRENT_STATE_NAME = BTN_MAP[ wButtonNum ][ "state" ];
	await Redis.keySet( RC.ACTIVE_STATE , CURRENT_STATE_NAME );
	await Redis.keySet( RC.FP , launching_fp );
	if ( wOptions.mode ) { await Redis.keySet( RC.MODE , wOptions.mode ); }

	// Get Previous State
	let previous_state = await Redis.keyGetMulti( RC.FP , RC.MODE );

	// However , if This is a Repeat of our Previous State , Just Assume Misclick and Exit
	if ( previous_state ) { if ( previous_state[ 0 ] ) { if ( previous_state[ 1 ] ) {
		if ( previous_state[ 0 ] === launching_fp ) {
			if ( wOptions ) {
				if ( wOptions.mode ) {
					if ( wOptions.mode === CURRENT_STATE_MODE ) { return; }
				}
			}
			else { return; }
		}
	}}}

	// Further Cleanup
	await CURRENT_STATE_STOP();
	require( "./utils/CEC_USB.js" ).activate();

	// Finally Start New State / Session
	CURRENT_STATE_FP = launching_fp;
	CURRENT_STATE_MODE = wOptions.mode;
	CURRENT_STATE_OPTIONS = wOptions;

	CURRENT_STATE = require( launching_fp );
	await CURRENT_STATE.start( wOptions );

}
module.exports.pressButtonMaster = PRESS_BUTTON;

// MODULES
// ======================================================================
// ======================================================================
const BTN_MAN 			= require( ".//modules/buttons/Manager.js" );
//const MOPIDY_MAN 		= require( "./modules/mopidy/Manager.js" );
//const SCHEDULE_MAN 		= require( "./scheduleManager.js" );
// ======================================================================
// ======================================================================

( async ()=> {
	await Reporter.log( "Initializing stuff" );
	await require( "./modules/mopidy/Manager.js" ).initialize();
	await require( "./modules/localmedia/Manager.js" ).initialize();
	await require( "./modules/youtube/Manager.js" ).initialize();
	await Reporter.log( "we are done with Initialization" );
	console.log( await require( "./utils/Generic.js" ).getStatusReport() );
})();