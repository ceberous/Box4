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

module.exports.previous = {
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
};

module.exports.next = {
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
};
// ========================================================================================
// Buttons=================================================================================


// Common State Names
// ========================================================================================
// ========================================================================================
module.exports.relax = {
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
};

module.exports.odyssey = {
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
};

module.exports.music = {
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
};
// ========================================================================================
// Common State Names======================================================================