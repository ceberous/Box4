module.exports.redis = {
	connection: {
		host: "localhost" ,
		port: "6379" ,
		database_number: 4 ,
	}
};

module.exports.MEDIA_MOUNT_POINT = { UUID: "B40C6DD40C6D9262" }; // Toshiba 1tb

module.exports.buttons = {

	// 1.) === MAIN BUTTONS

	// Muted Youtube Live videos from Followd Channels 
	0: { name: "Youtube Live Background" ,  state: "Youtube" , options: { mode: "LIVE" , position: "BACKGROUND" } } ,

	// Google Music
	1: { name: "UNKNOWN Music with Youtube Live in the Background" , session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN" } } ,
	2: { name: "UNKNOWN Music with Youtube Live in the Background" , session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN" }  } ,

	// Live Twitch or Youtube Followers Posted Videos
	3: { name: "Watch Live Twitch Followers or Youtube Standard Videos if All Followers Are Offline" , session: "Twitch_IF_Live_ELSE_YT_Standard_Foreground" , options: {} } ,

	// Video Calling
	4: { name: "Call Discord Person-1" , state: "Discord_Call_Foreground" , options: { users: [ "DISCORD.CALLE1" ] } } ,
	5: { name: "Call Discord Person-2" , state: "Discord_Call_Foreground" , options: { users: [ "DISCORD.CALLE2" ] } } ,

	// Control
	6: { name: "Stop" , label: "stop" } ,
	7: { name: "Pause" , label: "pause" } ,
	8: { name: "Previous" , label: "previous" } ,
	9: { name: "Next" , label: "next" } ,

	// States
	10: { name: "Watch a Movie" , state: "LocalMedia_Movie_Foreground" , options: {} } ,
	11: { name: "Odyssey with Youtube Live in the Background" , session: "LocalMedia_Odyssey_Foreground_YT_Live_Background" , options: {} } ,
	12: { name: "Watch a TV Show" , state: "LocalMedia_Foreground" , options: { genre: "TVShows" , advance_show: "true" , specific_show: "false" , specific_episode: "false" } } ,

	// 2.) === Extras
	
	// Youtube
	13: { name: "Watch Youtube Currated Videos , then start Odyseey and Youtube Live in the Background" , session: "YT_Currated_THEN_Odyssey_Foreground_YT_Live_Background" , options: {} } ,
	14: { name: "Watch Youtube Followers Videos" , state: "Youtube" , options: { mode: "STANDARD" , position: "FOREGROUND" } } ,
	15: { name: "Watch Youtube Currated Videos" , state: "Youtube" , options: { mode: "CURRATED" , position: "FOREGROUND" } } ,
	16: { name: "Watch Youtube Relaxing Videos" , state: "Youtube" , options: { mode: "RELAX" , position: "FOREGROUND" } } ,
	17: { name: "Watch Youtube Single Video" , state: "Youtube" , options: { mode: "SINGLE" , position: "FOREGROUND" } } ,
	18: { name: "Watch Youtube List of Videos" , state: "Youtube" , options: { mode: "LIST" , position: "FOREGROUND" } } ,
	19: { name: "Watch Official Youtube Playlist ID" , state: "Youtube" , options: { mode: "PLAYLIST_OFFICIAL" , position: "FOREGROUND" ,  playlist_id: "PLcW8xNfZoh7cxWFftCwzHJA3foHba1SzF" } } ,
	
	// Instagram
	20: { name: "Look at Instagram Followers Photos" , state: "Instagram_Background" , options: {} } ,

};

module.exports.youtube = {
	LIVE: {
		FOLLOWERS: [
			{
				name : "" ,
				id: "UCnM5iMGiKsZg-iOlIO2ZkdQ"
			} ,
			{
				name : "" ,
				id: "UCakgsb0w7QB0VHdnCc-OVEA"
			} ,
			{
				name : "" ,
				id: "UCZvXaNYIcapCEcaJe_2cP7A"
			} ,
			{
				name : "" ,
				id: "UCUPn5IEQugMf_JeNJOV9p2A"
			} ,			

		] ,
		BLACKLIST: [ "N5UUv-tgyDg" , "9zMpeUh6DXs" , "bNc7rGEBrMA" , "Mk9gQcHueeE" , "uyTAj1sbThg" , "cdKLSA2ke24" , "SwS3qKSZUuI" , "ddFvjfvPnqk" , "MFH0i0KcE_o" , "nzkns8GfV-I" , "qyEzsAy4qeU" , "KIyJ3KBvNjA" , "FZvR0CCRNJg" , "q_4YW_RbZBw" , "pwiYt6R_kUQ" , "T9Cj0GjIEbw" ] ,
	} ,
	STANDARD: {
		FOLLOWERS: [
			{
				name : "" ,
				id: "UCk0UErv9b4Hn5ucNNjqD1UQ"
			} ,
			{
				name : "" ,
				id: "UCKbVtAdWFNw5K7u2MZMLKIw"
			} ,
		] ,
		BLACKLIST: [] ,
	} ,
	RELAX: {
		FOLLOWERS: [
			{
				name : "Relax Daily" ,
				id: "UCc9EzBNAtdnNiDrMw5CAxUw"
			}
		]
	}
};

module.exports.instagram = [
	"ceberous"
];