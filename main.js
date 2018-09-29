// console.log = function( msg ){ 
// 	if ( msg === null ) {
// 		console.trace(); 
// 	}
// 	else if ( msg === "null" ) { 
// 		console.trace(); 
// 	}
// };

// https://www.amazon.com/dp/B077L3HYYW

process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});


const http = require( "http" );
const ip = require( "ip" );
const localIP = ip.address();
const WebSocket = require( "ws" );
const RMU = require( "redis-manager-utils" );
const FirefoxWrapper = require( "firefox-wrapper" );

( async ()=> {

	// Config
	let config;
	console.log( process.env.NODE_ENV );
	switch( process.env.NODE_ENV ){
		case "development":
			config = require( "./local_config.js" );
			break;
		case "production":
			config = require( "./config.js" );
			break;
		default:
			config = require( "./config.js" );
			break;
	}
	module.exports.config = config;
	let port = process.env.PORT || 6969;
	module.exports.port = port;

	// Personal
	let personal = require( "./personal.js" );
	module.exports.personal = personal;
	
	// Constants
	let constants = require( "./server/constants/generic.js" );
	module.exports.constants = constants;

	// Emitter
	let emitter = new ( require( "events" ).EventEmitter );
	module.exports.emitter = emitter;
	
	// Redis
	let rc = require( "./server/constants/redis.js" );
	module.exports.rc = rc;	
	let redis = new RMU({
		databaseNumber: config.redis.connection.database_number ,
		port: config.redis.connection.port ,
		host: config.redis.connection.host ,
		constants: rc
	});
	await redis.init();
	module.exports.redis = redis;
	config.buttons = require( "./server/utils/Config.js" ).addStateAndSessionFilePaths( config.buttons );

	// Initialize Reporting / Logging
	await require( "./server/utils/Reporter.js" ).initialize();

	await require( "./server/utils/Config.js" ).saveConfigToRedis();	

	// State Manger
	let StateManager = await require("./server/StateManager.js");
	module.exports.StateManager = StateManager;

	// Firefox
	let FFManager = undefined;
	module.exports.FFManager = FFManager;

	// Express App
	let express_app = require( "./server/express/app.js" );

	// Express Server
	express_server = http.createServer( express_app );

	// WebSocket
	let web_socket_manager = require( "./server/WebSocketManager.js" );	
	let web_socket_server = new WebSocket.Server({ server: express_server });
	web_socket_server.on( "connection" , web_socket_manager.onConnection );
	module.exports.wss = web_socket_server;

	express_server.listen( port , function() {
		require( "./server/utils/Reporter.js" ).log(
			"\n\tServer Started on :" + 
			"\n\thttp://" + localIP + ":" + port +
			"\n\t\t or" + 
			"\n\thttp://localhost:" + port
		);
	});	

	process.on( "unhandledRejection" , async function( reason , p ) {
		await require( "./server/utils/Reporter.js" ).error( reason );
	});
	process.on( "uncaughtException" , async function( err ) {
		await require( "./server/utils/Reporter.js" ).error( err );
	});

	process.on( "SIGINT" , async function () {
		//wEmitter.emit( "closeEverything" );
		await require( "./server/utils/Reporter.js" ).log( "\nShutting Down" );
		//await MyBox4.buttons.press( 6 , {} , true );
		process.exit( 1 );
	});	

})();