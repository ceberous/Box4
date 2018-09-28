

function INITIALIZE () {
	return new Promise( function( resolve , reject ) {
		try {
			await require( "./Standard.js" ).update();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
moduele.exports.initialize = INITIALIZE;