const colors = require("colors");

const wEmitter = require( "../../../main.js" ).emitter;
//var wGet_Last_SS = require( "../../clientManager.js" ).get_Last_SS;

// Can't Require , only can stub out const FilPath ,
// this gets loaded early by express and the way mopidy gets loaded is

// const wMopidyGetCachedPlaylists 	= require( "../../modules/mopidy/Manager.js" ).getCachedPlaylists;
// const wMopidyPause 					= require( "../../modules/mopidy/Manager.js" ).pause;
// const wMopidyResume 				= require( "../../modules/mopidy/Manager.js" ).resume;
// const wMopidyStop 					= require( "../../modules/mopidy/Manager.js" ).stop;
// const wMopidyPreviousSong 			= require( "../../modules/mopidy/Manager.js" ).previousSong;
// const wMopidyNextSong 				= require( "../../modules/mopidy/Manager.js" ).nextSong;
// const wMopidyStartPlaylist 			= require( "../../modules/mopidy/Manager.js" ).loadPlaylistID;
// const wMopidyStartNewTask 			= require( "../../modules/mopidy/Manager.js" ).startNewTask;
// const wMopidyUpdatePlaylistGenre 	= require( "../../modules/mopidy/Manager.js" ).updatePlaylistGenre;

function wcl( wSTR ) { console.log( colors.white.bgBlue( "[CLIENT_CTRL] --> " + wSTR ) ); }

function sendJSONResponse( res , status , content ) {
    if ( status ) { res.status( status ); }
    res.json( content );
}

module.exports.getStatus = function( req , res ) {
	//var wOBJ = wGet_Last_SS();
	var wOBJ = wGet_Last_SS();
	wcl( "we are in getStatus" );
	console.log( wOBJ );
	sendJSONResponse( res , 200 , wOBJ );
};

module.exports.getMopidyPlaylists = function( req , res ) {
	var wOBJ = { playlists: wMopidyGetCachedPlaylists() };
	sendJSONResponse( res , 200 , wOBJ );
};

module.exports.mopidyPause = function( req , res ) {
	wMopidyPause();
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyResume = function( req , res ) {
	wMopidyResume();
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyStop = function( req , res ) {
	wMopidyStop();
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyPreviousSong = function( req , res ) {
	wMopidyPreviousSong();
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyNextSong = function( req , res ) {
	wMopidyNextSong();
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyStartPlaylist = function( req , res ) {
	wMopidyStartPlaylist( req.params.genre , req.params.playlistID );
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyStartNewTask = function( req , res ) {
	wMopidyStartNewTask( req.params.task );
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyUpdatePlaylistGenre = async function( req , res ) {
	var wR = await wMopidyUpdatePlaylistGenre( req.params.playlistID , req.params.oldGenre , req.params.newGenre );
	sendJSONResponse( res , 200 , { result: wR } );
};

module.exports.getSavedVideoModel = function( req , res ) {
	sendJSONResponse( res , 200 , { status: "we were here" } );
};