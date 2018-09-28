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
const Reporter = require( "lilreporter" );
const RMU = require( "redis-manager-utils" );

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

	// Reporter
	let reporter = new Reporter( { discord: personal.discord } );
	await reporter.init();
	module.exports.reporter = reporter;
	await require( "./server/utils/Generic.js" ).sleep( 2000 );

	await require( "./server/utils/Config.js" ).saveConfigToRedis();	

	// State Manger
	let StateManager = await require("./server/StateManager.js");
	module.exports.StateManager = StateManager;

	// Express App
	let express_app = require( "./server/express/app.js" );

	// Express Server
	express_server = http.createServer( express_app );

	// WebSocket
	let web_socket_manager = new require( "./server/WebSocketManager.js" );	
	let web_socket_server = new WebSocket.Server({ server: express_server });
	web_socket_server.on( "connection" , web_socket_manager.onConnection );
	module.exports.wss = web_socket_server;

	express_server.listen( port , function() {
		console.log( "\tServer Started on :" );
		console.log( "\thttp://" + localIP + ":" + port );
		console.log( "\t\t or" );
		console.log( "\thttp://localhost:" + port );
	});	

	process.on( "unhandledRejection" , async function( reason , p ) {
		await reporter.error( reason );
	});
	process.on( "uncaughtException" , async function( err ) {
		await reporter.error( err );
	});

	process.on( "SIGINT" , async function () {
		//wEmitter.emit( "closeEverything" );
		console.log( "\nShutting Down" );
		//await MyBox4.buttons.press( 6 , {} , true );
		process.exit( 1 );
	});	

})();