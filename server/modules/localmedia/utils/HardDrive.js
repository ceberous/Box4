const MainFP = process.mainModule.paths[ 0 ].split( "node_modules" )[ 0 ].slice( 0 , -1 );
const path = require( "path" );
const Reporter = require( path.join( MainFP , "server" , "utils" , "Reporter.js" ) );
const Redis = require( path.join( MainFP , "main.js" ) ).redis;
const RC = Redis.c.LOCAL_MEDIA;

require( "shelljs/global" );
// const fs = require( "fs" );
// const exfs = require("extfs");
//const PATH = require( "path" );

const Sleep = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).sleep;
//const GetDuration = require( path.join( MainFP , "server" , "utils" , "Generic.js" ) ).getDuration;

function FIND_USB_STORAGE_PATH_FROM_UUID( wUUID ) {
	function getPath() {
		const findMountPointCMD = "findmnt -rn -S UUID=" + wUUID + " -o TARGET";
		var findMountPoint = exec( findMountPointCMD , { silent:true , async: false } );
		if ( findMountPoint.stderr ) { Reporter.log("error finding USB Hard Drive"); process.exit(1); }
		return findMountPoint.stdout.trim();
	}	
	return new Promise( function( resolve , reject ) {
		try {
			//var findEventPathCMD = exec( "sudo blkid" , { silent: true , async: false } );
			var findEventPathCMD = exec( "ls -l /dev/disk/by-uuid" , { silent: true , async: false } );
			if ( findEventPathCMD.stderr ) { Reporter.log("error finding USB Hard Drive"); process.exit(1); }

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
				if ( !uuid[ 8 ] ) { continue; }
				if ( uuid[ 8 ] !== wUUID ) { continue; }				
				uuid = uuid[ 8 ];
				var q1 = getPath();
				q1 = q1.replace( "x20" , " " )
				
				if ( q1 === "" ) {

					Reporter.log( "USB Drive Plugged IN , but unmounted" );
					Reporter.log( "Mounting ...." );

					var wUSER = exec( "whoami" , { silent:true , async: false } );
					if ( wUSER.stderr ) { Reporter.log("error finding USB Hard Drive"); process.exit(1); }
					wUSER = wUSER.stdout.trim();

					var wPath = path.join( "/" , "media" , wUSER , wUUID )

					var wMKDIR = exec( "sudo mkdir -p " + wPath , { silent: true , async: false } );
					if ( wMKDIR.stderr ) { Reporter.log("error creating USB Hard Drive Media Path"); process.exit(1); }

					var mountCMD = "sudo mount -U " + wUUID +" --target " + wPath;
					Reporter.log(mountCMD);
					var wMount = exec( mountCMD , { silent: true , async: false } );
					if ( wMount.stderr ) { Reporter.log("error Mounting USB Hard Drive"); process.exit(1); }

					q1 = getPath();
					if ( q1 === "" ) { Reporter.log("Still Can't Mount HardDrive Despite all Efforts"); process.exit(1); }

				}
				q1 = path.resolve( q1 );
				//Reporter.log( q1 )
				resolve( q1 );
				return;
			}
			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}
module.exports.findAndMountUSB_From_UUID = FIND_USB_STORAGE_PATH_FROM_UUID;

function REBUILD_REDIS_MOUNT_POINT_REFERENCE( wMountPoint ) {
	return new Promise( async function( resolve , reject ) {
		try {
			
			// Scan Mount_Point
			const x1 = require( "./ScanDirectory.js" ).scan( wMountPoint );
			await Redis.keySet( RC.BASE + "SKELETON" , JSON.stringify( x1 ) );
			//Reporter.log( x1 );

			// Sort

			// Each Genre
			const total_genres = Object.keys( x1 ).length;
			await Redis.keySetMulti([
				[ "set" , RC.BASE + "GENRES" + ".TOTAL" , total_genres ] ,
				[ "set" , RC.BASE + "GENRES" + ".CURRENT_INDEX" , 0 ] ,
			]);			
			for ( genre in x1 ) { // Each Genre
				//Reporter.log( "\n--> " + genre );					

				const total_shows = Object.keys( x1[ genre ] ).length;
				if ( total_shows < 1 ) { continue; }
				await Redis.keySetMulti([
					[ "set" , RC.BASE + "GENRES." + genre + ".TOTAL_SHOWS" , total_shows ] ,
					[ "set" , RC.BASE + "GENRES." + genre + ".CURRENT_INDEX" , 0 ] ,
				]);
				await Redis.listSetFromArray( RC.BASE + "GENRES." + genre + ".SHOWS" , Object.keys( x1[ genre ] ) );

				for ( show in x1[ genre ] ) { // Each 'Show'
					//Reporter.log( "\t--> " + show );

					const total_seasons = Object.keys( x1[ genre ][ show ] ).length;
					if ( total_seasons < 1 ) { continue; }
					await Redis.keySetMulti([
						[ "set" , RC.BASE + "GENRES." + genre + "." + show + ".TOTAL_SEASONS" , total_seasons ] ,
						[ "set" , RC.BASE + "GENRES." + genre + "." + show + ".CURRENT_INDEX" , 0 ] ,
					]);

					for ( var season = 0; season < x1[ genre ][ show ].length; ++season ) { // Each 'Season'
						//Reporter.log( "\t\t--> " + ( i + 1 ).toString() );

						const season_details_part = "GENRES."  + genre + ".SHOWS." + show + ".SEASON." + ( season + 1 ).toString();
						const season_key = RC.BASE + season_details_part;
						const episode_paths = x1[ genre ][ show ][ season ].map( x => x.path );
						await Redis.keySetMulti([
							[ "set" , season_key + ".TOTAL_EPISODES" , episode_paths.length ] ,
							[ "set" , season_key + ".CURRENT_INDEX" , 0 ] ,
						]);
						await Redis.listSetFromArray( season_key , episode_paths );
						
						for ( var j = 0; j < x1[ genre ][ show ][ season ].length; ++j ) {
							//Reporter.log( "\t\t\t--> " + x1[ genre ][ show ][ season ][ j ].name );
							//Reporter.log( "\t\t\t--> " + x1[ genre ][ show ][ season ][ j ].path );
							const passive_episode_key =  RC.PASSIVE.BASE + season_details_part + ".EPISODE." + ( j + 1 ).toString();
							//const duration = await GetDuration( x1[ genre ][ show ][ season ][ j ].path );
							await Redis.hashSetMulti( passive_episode_key ,
								"name" , x1[ genre ][ show ][ season ][ j ].name ,
								"genre" , genre , 
								"show" , show , 
								"season_index" , season ,
								"episode_index" , j ,
								"fp" , x1[ genre ][ show ][ season ][ j ].path ,
								"completed" , false ,
								"skipped" , false ,
								"current_time" , 0 ,
								"remaining_time" , 0 ,
								"duration" , 0
							);
						}

					}

				}

			}

			resolve();
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
}

function REINITIALIZE_MOUNT_POINT() {
	return new Promise( async function( resolve , reject ) {
		try {
			// 1.) Lookup mount point to see if valid , else build reference
			var wLiveMountPoint = await Redis.keyGet( RC.MOUNT_POINT );
			if ( !wLiveMountPoint ) {
				Reporter.log( "No Media Reference Found , Trying to Rebuild from --> " );
				const MOUNT_CONFIG = await Redis.keyGetDeJSON( "CONFIG.MEDIA_MOUNT_POINT" );
				if ( MOUNT_CONFIG[ "UUID" ] ) {
					Reporter.log( "UUID: " + MOUNT_CONFIG[ "UUID" ] );
					wLiveMountPoint = await FIND_USB_STORAGE_PATH_FROM_UUID( MOUNT_CONFIG[ "UUID" ] );
					if ( !wLiveMountPoint ) { Reporter.log( "Couldn't Locate Mount Point" ); resolve( "bad_mount_point" ); return; }
					wLiveMountPoint = wLiveMountPoint + "/MEDIA_MANAGER/";
				}
				else if ( MOUNT_CONFIG[ "LOCAL_PATH" ] ) {
					Reporter.log( "LOCAL_PATH: " + MOUNT_CONFIG[ "LOCAL_PATH" ] );
					wLiveMountPoint = MOUNT_CONFIG[ "LOCAL_PATH" ];
				}
				else { Reporter.log( "We Were Not Told Where to Find any Local Media" ); resolve( "no_local_media" ); return; }
				// Reporter.log( wLiveMountPoint );
				// const dirExists = FS.existsSync( wLiveMountPoint );
				// if ( !dirExists ) { Reporter.log( "Local Media Folder Doesn't Exist" ); resolve( "no_local_media" ); return; }
				//const isEmpty = await exfs.isEmpty( wLiveMountPoint );
				//if ( isEmpty ) { Reporter.log( "Local Media Folder is Empty" ); resolve( "no_local_media" ); return; }
				// Cleanse and Prepare Mount_Point
				await Redis.deleteMultiplePatterns( [ RC.BASE + "*" , "HARD_DRIVE.*" , "LAST_SS.LOCAL_MEDIA.*" ] );
				//await wSleep( 2000 );
				await REBUILD_REDIS_MOUNT_POINT_REFERENCE( wLiveMountPoint );
				await Redis.keySet( RC.MOUNT_POINT , wLiveMountPoint );
			}
			resolve( wLiveMountPoint );
		}
		catch( error ) { Reporter.log( error ); reject( error ); }
	});
} 
module.exports.reinitializeMountPoint = REINITIALIZE_MOUNT_POINT;