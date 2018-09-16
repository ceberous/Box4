const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const path = require( "path" );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.LOCAL_MEDIA;

require( "shelljs/global" );
// const fs = require( "fs" );
// const exfs = require("extfs");
//const PATH = require( "path" );
const colors	= require( "colors" );
function wcl( wSTR ) { console.log( colors.magenta.bgBlack( "[HARD_DRIVE_UTIL] --> " + wSTR ) ); }
const Sleep = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).sleep;

const CustomDirectoryScanner = require( "./ScanDirectory.js" );

function FIND_USB_STORAGE_PATH_FROM_UUID( wUUID ) {
	function getPath() {
		const findMountPointCMD = "findmnt -rn -S UUID=" + wUUID + " -o TARGET";
		var findMountPoint = exec( findMountPointCMD , { silent:true , async: false } );
		if ( findMountPoint.stderr ) { console.log("error finding USB Hard Drive"); process.exit(1); }
		return findMountPoint.stdout.trim();
	}	
	return new Promise( function( resolve , reject ) {
		try {
			//var findEventPathCMD = exec( "sudo blkid" , { silent: true , async: false } );
			var findEventPathCMD = exec( "ls -l /dev/disk/by-uuid" , { silent: true , async: false } );
			if ( findEventPathCMD.stderr ) { wcl("error finding USB Hard Drive"); process.exit(1); }

			var wOUT = findEventPathCMD.stdout.split("\n");
			for ( var i = 0; i < wOUT.length; ++i ) {

				// var uuid = wOUT[ i ].indexOf( "UUID=" );
				// if ( uuid === -1 ) { continue; }

				// uuid = wOUT[ i ].split( "UUID=" )[ 1 ];
				// uuid = uuid.split( " " )[ 0 ];
				// if ( uuid.indexOf( "-" ) !== -1 ) { continue; }
				// if ( uuid.indexOf( '"' ) !== -1 ) { uuid = uuid.split( '"' )[ 1 ]; }

				// if ( uuid !== wUUID ) { continue; }

				var uuid = wOUT[ i ].split( " " );
				console.log( uuid[ 8 ] );
				if ( !uuid[ 8 ] ) { continue; }
				if ( uuid !== wUUID ) { continue; }				

				console.log( uuid );
				var q1 = getPath();
				q1 = q1.replace( "x20" , " " )
				
				if ( q1 === "" ) {

					console.log( "USB Drive Plugged IN , but unmounted" );
					console.log( "Mounting ...." );

					var wUSER = exec( "whoami" , { silent:true , async: false } );
					if ( wUSER.stderr ) { console.log("error finding USB Hard Drive"); process.exit(1); }
					wUSER = wUSER.stdout.trim();

					var wPath = path.join( "/" , "media" , wUSER , wUUID )

					var wMKDIR = exec( "sudo mkdir -p " + wPath , { silent: true , async: false } );
					if ( wMKDIR.stderr ) { console.log("error creating USB Hard Drive Media Path"); process.exit(1); }

					var mountCMD = "sudo mount -U " + wUUID +" --target " + wPath;
					console.log(mountCMD);
					var wMount = exec( mountCMD , { silent: true , async: false } );
					if ( wMount.stderr ) { console.log("error Mounting USB Hard Drive"); process.exit(1); }

					q1 = getPath();
					if ( q1 === "" ) { console.log("Still Can't Mount HardDrive Despite all Efforts"); process.exit(1); }

				}
				q1 = path.resolve( q1 );
				console.log( q1 )
				resolve( q1 );
				return;
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.findAndMountUSB_From_UUID = FIND_USB_STORAGE_PATH_FROM_UUID;

function REBUILD_REDIS_MOUNT_POINT_REFERENCE( wMountPoint ) {
	return new Promise( async function( resolve , reject ) {
		try {
			
			// Scan Mount_Point
			//const x1 = await BUILD_HD_REF( wMountPoint );
			const x1 = CustomDirectoryScanner( wMountPoint );
			console.log( x1 );

			// Each Genre
			const genres = Object.keys( x1 );
			if ( genres.length < 1 ) { resolve( "empty" ); return; }
			await RU.setMulti([
				[ "set" , RC.BASE + "GENRES" + ".TOTAL" , genres.length ] ,
				[ "set" , RC.BASE + "GENRES" + ".CURRENT_INDEX" , 0 ] ,
			]);
			await RU.setListFromArray( RC.BASE + "GENRES" , genres );
			for ( var i = 0; i < genres.length; ++i ) {
				
				// Each Show In Genre
				const shows = Object.keys( genres[ i ] );
				if ( shows.length < 1 ) { continue; }
				await RU.setMulti([
					[ "set" , RC.BASE + "GENRES." + genres[ i ] + ".TOTAL_SHOWS" , shows.length ] ,
					[ "set" , RC.BASE + "GENRES." + genres[ i ] + ".CURRENT_INDEX" , 0 ] ,
				]);
				await RU.setListFromArray( RC.BASE + "GENRES."  + genres[ i ] + ".SHOWS" , shows );
				for ( var j = 0; j < genres[ i ][ shows[ j ] ].length; ++j ) {

					// Each Season in Show
					const seasons = Object.keys( genres[ i ][ shows[ j ] ] );
					if ( seasons.length < 1 ) { continue; }
					await RU.setMulti([
						[ "set" , RC.BASE + "GENRES." + genres[ i ] + "." + shows[ j ] + ".TOTAL_SEASONS" , seasons.length ] ,
						[ "set" , RC.BASE + "GENRES." + genres[ i ] + "." + shows[ j ] + ".CURRENT_INDEX" , 0 ] ,
					]);
					await RU.setListFromArray( RC.BASE + "GENRES." + genres[ i ] + "." + shows[ j ] + ".SEASONS" , seasons );
					for ( var k = 0; k < seasons.length; ++k ) {

						// Each Episode in Season
						const episodes = Object.keys( genres[ i ][ shows[ j ] ][ seasons[ k ] ] );
						if ( episodes.length < 1 ) { continue; }
						await RU.setMulti([
							[ "set" , RC.BASE + "GENRES." + genres[ i ] + "." + shows[ j ] + "." + k.toString() + ".TOTAL_EPISODES" , seasons.length ] ,
							[ "set" , RC.BASE + "GENRES." + genres[ i ] + "." + shows[ j ] + "." + k.toString() + ".CURRENT_INDEX" , 0 ] ,
						]);
						await RU.setListFromArray( RC.BASE + genres[ i ] + "." + shows[ j ] + "." + k.toString() + ".EPISODES" , episodes );
						for ( var e = 0; e < episodes.length; ++e ) {

							const fp = path.join( RC.BASE , genres[ i ] , shows[ j ] , k , episodes[ e ] );
							console.log( fp );

						}

					}

				}

			}

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REINITIALIZE_MOUNT_POINT() {
	return new Promise( async function( resolve , reject ) {
		try {
			// 1.) Lookup mount point to see if valid , else build reference
			var wLiveMountPoint = await Redis.keyGet( RC.MOUNT_POINT );
			if ( !wLiveMountPoint ) {
				wcl( "No Media Reference Found , Trying to Rebuild from --> " );
				const MOUNT_CONFIG = await Redis.keyGetDeJSON( "CONFIG.MEDIA_MOUNT_POINT" );
				if ( MOUNT_CONFIG[ "UUID" ] ) {
					wcl( "UUID: " + MOUNT_CONFIG[ "UUID" ] );
					wLiveMountPoint = await FIND_USB_STORAGE_PATH_FROM_UUID( MOUNT_CONFIG[ "UUID" ] );
					if ( !wLiveMountPoint ) { wcl( "Couldn't Locate Mount Point" ); resolve( "bad_mount_point" ); return; }
					wLiveMountPoint = wLiveMountPoint + "/MEDIA_MANAGER/";
				}
				else if ( MOUNT_CONFIG[ "LOCAL_PATH" ] ) {
					wcl( "LOCAL_PATH: " + MOUNT_CONFIG[ "LOCAL_PATH" ] );
					wLiveMountPoint = MOUNT_CONFIG[ "LOCAL_PATH" ];
				}
				else { wcl( "We Were Not Told Where to Find any Local Media" ); resolve( "no_local_media" ); return; }
				// console.log( wLiveMountPoint );
				// const dirExists = FS.existsSync( wLiveMountPoint );
				// if ( !dirExists ) { wcl( "Local Media Folder Doesn't Exist" ); resolve( "no_local_media" ); return; }
				//const isEmpty = await exfs.isEmpty( wLiveMountPoint );
				//if ( isEmpty ) { wcl( "Local Media Folder is Empty" ); resolve( "no_local_media" ); return; }
				// Cleanse and Prepare Mount_Point
				await Redis.deleteMultiplePatterns( [ ( RC.BASE + "*" ) , "HARD_DRIVE.*" , "LAST_SS.LOCAL_MEDIA.*" ] );
				//await wSleep( 2000 );
				await REBUILD_REDIS_MOUNT_POINT_REFERENCE( wLiveMountPoint );
				await Redis.keySet( RC.MOUNT_POINT , wLiveMountPoint );
			}
			resolve( wLiveMountPoint );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
} 
module.exports.reinitializeMountPoint = REINITIALIZE_MOUNT_POINT;