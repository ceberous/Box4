const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const path = require( "path" );
const GetStatus = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).getStatusReport;

function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

module.exports.all = async function( req , res ) {
	console.log( "Express /status/" );
	let cur_status =  await GetStatus();
	sendJSONResponse( res , 200 , { status: cur_status } ); 
};