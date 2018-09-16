const fs = require( "fs" );
const path = require( "path" );

const constants = {
	DIRECTORY: 'directory',
	FILE: 'file'
}

function safeReadDirSync (wPath) {
	let dirData = {};
	try {
		dirData = fs.readdirSync(wPath);
	} catch(ex) {
		console.log( ex );
		if (ex.code == "EACCES")
			//User does not have permissions, ignore directory
			return null;
		else throw ex;
	}
	return dirData;
}

function CustomDirTree( wPath ) {
	wPath = wPath.replace( String.fromCharCode(92) + " " , " " );
	const name = path.basename(wPath);
	const item = { wPath, name };
	let stats;
	wPath = path.normalize( wPath );
	try { stats = fs.statSync(wPath); }
	catch (e) { console.log(  e ); return null; }
	if (stats.isFile()) {
		const ext = path.extname(wPath).toLowerCase();
		item.size = stats.size;  // File size in bytes
		item.extension = ext;
		item.type = constants.FILE;
	}
	else if (stats.isDirectory()) {
		let dirData = safeReadDirSync(wPath);
		if (dirData === null) return null;
		
		item.children = dirData
			.map(child => CustomDirTree(path.join(wPath, child)))
			.filter(e => !!e);
		item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
		item.type = constants.DIRECTORY;
	} else {
		return null; // Or set item.size = 0 for devices, FIFO and sockets ?
	}
	return item;
}

function CustomMediaBoxScanner( wPath ) {
	console.log( "Searching --> " + path.resolve( wPath ) );
	//const wTree = dirTree( wPath );
	const wTree = CustomDirTree( wPath );
	console.log( wTree );
	var Tree = {
		"audiobooks": {} ,
		"dvds": {} ,
		"tvshows": {} ,
		"movies": {} ,
		"music": {} ,
		"odyssey": {} ,
		"documentaries": {} ,
		"podcasts": {} ,
	}
	var finalGenres = {};

	for ( var i = 0; i < wTree.children.length; ++i ) { 

		let genre = wTree.children[ i ].name.toLowerCase();
		//console.log( "Sorting --> " + genre );

		if ( Tree[ genre ] ) {  // Each Genre

			Tree[ genre ] = wTree.children[ i ].children;

			var shows = {};
			for ( var j = 0; j < Tree[ genre ].length; ++j ) {  // Each Show

				let show_name = Tree[ genre ][ j ].name;
				//console.log( "\tSorting --> " + show_name );

				shows[ show_name ] = [];

				var seasons = {};
				if ( Tree[ genre ][ j ].type === "file" ) {
					//if ( !seasons[ "singles" ] ) { seasons[ "singles" ] = []; }
					//seasons[ "singles" ].push( Tree[ genre ][ j ] );
					shows[ show_name ].push( Tree[ genre ][ j ] );
					continue;
				}
				
				if ( Tree[ genre ][ j ].type !== "directory" ) { continue; }

				for ( var k = 0; k < Tree[ genre ][ j ].children.length; ++k ) { // Each Season

					let season_name = Tree[ genre ][ j ].children[ k ].name;
					//console.log( "\t\tSorting --> " + season_name );
					let season = [];

					if ( Tree[ genre ][ j ].children[ k ].type === "file" ) {
						//console.log( "\t\t\t " + Tree[ genre ][ j ].children[ k ].name );
						//shows[ show_name ][ season_name ].push( Tree[ genre ][ j ].children[ k ] );
						season.push( Tree[ genre ][ j ].children[ k ] );
						continue;
					}

					else if ( Tree[ genre ][ j ].children[ k ].type !== "directory" ) { continue; }

					if ( Tree[ genre ][ j ].children[ k ].children ) {

						for ( var e = 0; e < Tree[ genre ][ j ].children[ k ].children.length; ++e ) {
							//console.log( "\t\t\t " + Tree[ genre ][ j ].children[ k ].children[ e ].name );
							//console.log( "\t\t\t " + Tree[ genre ][ j ].children[ k ].children[ e ].path );
							
							//shows[ show_name ][ season_name ].push( Tree[ genre ][ j ].children[ k ].children[ e ] );
							season.push( Tree[ genre ][ j ].children[ k ].children[ e ] );
						}

					}

					shows[ show_name ].push( season );

				}
				// console.log( seasons );
				finalGenres[ genre ] = shows;
			}

		}

		//Tree[ genre ] = finalGenres;

	}

	return finalGenres;

}
module.exports.scan = CustomMediaBoxScanner;

//console.log( CustomMediaBoxScanner( "/media/morpheous/TOSHIBA\ EXT/MEDIA_MANAGER" ) );