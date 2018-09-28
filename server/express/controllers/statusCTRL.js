function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

module.exports.all = function( req , res ) { 
	require( "../../utils/generic.js" ).rebootRouter();
	sendJSONResponse( res , 200 , { message: "Rebooted Router" } ); 
};