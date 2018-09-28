const ip = require("ip");
const fs = require("fs");
const path = require( "path" );
const Reporter = require( "./utils/Reporter.js" );

const wsClient = require( "../main.js" ).wss;
function BROADCAST_TO_ALL_CLIENTS( wMessage , wOptions ) {
	wsClient.clients.forEach( function each( ws ) { 
		ws.send( JSON.stringify( { message: wMessage , options: wOptions } ) ); 
	});
}
module.exports.broadcast = BROADCAST_TO_ALL_CLIENTS;

function ON_CONNECTION( wSocket , wReq ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const ip = wReq.connection.remoteAddress;
			Reporter.log( "New WebSocket Client Connected @@@ " + ip );
			const STAGED_FF_CLIENT_TASK = await require( "./utils/Generic.js" ).getStagedFFClientTask();
			await require( "../main.js" ).sendStagedWebSocketMessage();
			wSocket.on( "message" ,  function( message ) {
				try { message = JSON.parse( message ); }
				catch( e ) { var a = message; message = {"message": a}; }
				switch( message.message ) {
					case "pong":
						//console.log( "inside pong()" );
						this.isAlive = true;
						break;
					case "youtubeReadyForFullScreenGlitch":
						require( "./modules/firefox/Manager.js" ).youtubeFullScreen();
						break;
					case "twitchReadyForFullScreenGlitch":
						require( "./modules/firefox/Manager.js" ).twitchFullScreen();
						break;
					case "YTStandardVideoOver":
						//clientManager.pressButtonMaster( 9 ); // next
						require( "./YOUTUBE/generic.js" ).recordVideoWatched( message.id );
						break;
					case "YTCurratedVideoOver":
						require( "./Manager.js" ).pressButtonMaster( 9 ); // next
						break;
					case "YTRelaxingVideoOver":
						require( "./Manager.js" ).pressButtonMaster( 9 ); // next
						break;										
					case "youtubeNowPlayingID":
						Reporter.post( message.url );
						break;
					case "youtubeAuthHash":
						Reporter.local.log( message );
						break;
					case "InstagramMediaOver":
						require( "./modules/instagram/Manager.js" ).updateWatchedMedia( message.options )
						break;
					default:
						break;
				}
			});
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.onConnection = ON_CONNECTION;

function SEND_STAGED_WS_MESSAGE() {
	return new Promise( async function( resolve , reject ) {
		try {
			var STAGED_FF_CLIENT_TASK = await require( "./server/utils/generic.js" ).getStagedFFClientTask( true );
			Reporter.log( "Sending Staged FF Client Task to Websocket Clients = " + STAGED_FF_CLIENT_TASK );
			wsClient.clients.forEach( function each( ws ) {
				ws.send( STAGED_FF_CLIENT_TASK );
			});
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.sendStagedWebSocketMessage = SEND_STAGED_WS_MESSAGE;


function INITIALIZE( wPort ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const localIP = ip.address();
			const wSIP = 'var socketServerAddress = "' + localIP + '"; var socketPORT = "' + wPort + '";';	
			fs.writeFileSync( path.join( __dirname , ".." , "client" , "js" , "webSocketServerAddress.js" ) , wSIP );
			await Reporter.log( "Done Initializing" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;

( async ()=> {
	INITIALIZE();
})();

// // May not be necessary , because clients seem to be automatically deleteed in simple testing
// wss_interval = setInterval( function ping() {
// 	wss.clients.forEach( function each( ws ) {
// 		if ( ws.isAlive === false ) { wcl( "terminating client" ); return ws.terminate(); }
// 		ws.isAlive = false;
// 		ws.send( JSON.stringify( { message: "ping" } ) );
// 	});
// } , 30000 );