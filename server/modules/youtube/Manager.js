

function INITIALIZE () {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "./Standard.js" ).update();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;