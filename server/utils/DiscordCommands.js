const path = require( "path" );
const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const PB_FP = path.join( MainFP , "server" , "StateManager.js" );

// module.exports.buttonsCommand = function( msg , args ) {
// 	if( args.length === 0 ) {
// 		PressButton( "3" );
// 	}
// 	return;
// };

module.exports.stop = {
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
};

module.exports.pause = {
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
};