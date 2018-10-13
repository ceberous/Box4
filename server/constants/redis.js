module.exports.YOUTUBE = {
	BASE: "YOUTUBE." ,

	MODE: "YOUTUBE.MODE" ,
	NOW_PLAYING_ID: "YOUTUBE.NOW_PLAYING.ID" ,

	NP_SESSION_LIST: "YOUTUBE.NP_SESSION_LIST" ,
	NP_SESSION_INDEX: "YOUTUBE.NP_SESSION_INDEX" ,

	SKIPPED: "YOUTUBE.SKIPPED" ,
	WATCHED: "YOUTUBE.WATCHED" ,
	GLOBAL_BLACK_LIST: "YOU_TUBE.GLOBAL_BLACK_LIST" ,

	PRELIM_COUNT: "YOU_TUBE.PRELIMINARY_COUNT" ,
	ODYSSEY_PRELIM_TOTAL: "YOU_TUBE.ODYSSEY_PRELIM_TOTAL" ,

	LIVE: {
		BASE: "YOUTUBE.LIVE." ,
		STATUS: "STATUS.YT_LIVE" ,
		LATEST: "YOUTUBE.LIVE.LATEST" ,
		FOLLOWERS: "YOUTUBE.LIVE.FOLLOWERS" ,
		BLACKLIST: "YOUTUBE.LIVE.BLACKLIST" ,
		SKIPPED: "YOUTUBE.LIVE.SKIPPED" ,
		NOW_PLAYING_ID: "YOUTUBE.LIVE.NOW_PLAYING_ID"
	} ,
	STANDARD: {
		BASE: "YOUTUBE.STANDARD." ,
		STATUS: "STATUS.YT_STANDARD" ,
		PLACEHOLDER: "YOUTUBE.STANDARD.PLACEHOLDER" ,
		LATEST: "YOUTUBE.STANDARD.LATEST",
		QUE: "YOUTUBE.STANDARD.QUE" ,
		SKIPPED: "YOUTUBE.STANDARD.SKIPPED" ,
		WATCHED: "YOUTUBE.STANDARD.WATCHED" ,
		FOLLOWERS: "YOUTUBE.STANDARD.FOLLOWERS" ,
		BLACKLIST: "YOUTUBE.STANDARD.BLACKLIST" ,
		NOW_PLAYING_ID: "YOUTUBE.STANDARD.NOW_PLAYING_ID"
	} ,
	PLAYLISTS: {
		BASE: "YOUTUBE.PLAYLISTS." ,
		STATUS: "STATUS.YT_PLAYLISTS" ,
		QUE: "YOUTUBE.PLAYLISTS.QUE" ,
		SKIPPED: "YOUTUBE.PLAYLISTS.SKIPPED" ,
		WATCHED: "YOUTUBE.PLAYLISTS.WATCHED" ,
	} ,
	CURRATED: {
		BASE: "YOUTUBE.CURRATED." ,
		STATUS: "STATUS.YT_CURRATED" ,
		QUE: "YOUTUBE.CURRATED.QUE" ,
		SKIPPED: "YOUTUBE.CURRATED.SKIPPED" ,
		WATCHED: "YOUTUBE.CURRATED.WATCHED" ,
	} ,
	RELAX: {
		BASE: "YOUTUBE.RELAX." ,
		STATUS: "STATUS.YT_RELAX" ,
		QUE: "YOUTUBE.RELAX.QUE" ,
		RECYCLED_QUE: "YOUTUBE.RELAX.RECYCLED_QUE" ,
		SKIPPED: "YOUTUBE.RELAX.SKIPPED" ,
		WATCHED: "YOUTUBE.RELAX.WATCHED" ,
	} ,
	SESSIONS: {
		LIST: "YOUTUBE.SESSIONS.LIST" ,
		INDEX: "YOUTUBE.SESSIONS.INDEX" ,
	}
};

module.exports.INSTAGRAM = {
	BASE: "INSTAGRAM." ,
	STATUS: "STATUS.INSTAGRAM" ,
	FOLLOWERS: "INSTAGRAM.FOLLOWERS" ,
	MEDIA: "INSTAGRAM.MEDIA" ,
	PLACEHOLDER: "INSTAGRAM.PLACEHOLDER" ,
	LATEST: "INSTAGRAM.LATEST" ,
	ALREADY_WATCHED: "INSTAGRAM.ALREADY_WATCHED" ,
};

module.exports.LOCAL_MEDIA = {
	BASE: "LOCAL_MEDIA." ,
	STATUS: "STATUS.LOCAL_MEDIA" ,
	HD_BASE: "HARD_DRIVE." ,
	MOUNT_POINT: "HARD_DRIVE.MOUNT_POINT" ,
	CONFIG: {
		BASE: "LOCAL_MEDIA.CONFIG." ,
		GENRE: "LOCAL_MEDIA.CONFIG.LIVE.GENRE" ,
		ADVANCE_SHOW: "LOCAL_MEDIA.CONFIG.LOCAL_MEDIA.LIVE.ADVANCE_SHOW" ,
		SPECIFIC_SHOW: "LOCAL_MEDIA.CONFIG.LOCAL_MEDIA.LIVE.SPECIFIC_SHOW" ,
		SPECIFIC_SHOW: "LOCAL_MEDIA.CONFIG.LOCAL_MEDIA.LIVE.SPECIFIC_SHOW" ,
		SPECIFIC_EPISODE: "LOCAL_MEDIA.CONFIG.LOCAL_MEDIA.LIVE.SPECIFIC_EPISODE" ,
	} ,
	NOW_PLAYING: {
		"global": "LOCAL_MEDIA.NOW_PLAYING" ,
		"odyssey": "LOCAL_MEDIA.NOW_PLAYING.GENRES.odyssey." ,
		"tvshows": "LOCAL_MEDIA.NOW_PLAYING.GENRES.tvshows." ,
		"movies": "LOCAL_MEDIA.NOW_PLAYING.GENRES.movies." ,
		"music": "LOCAL_MEDIA.NOW_PLAYING.GENRES.music." ,
		"audiobooks": "LOCAL_MEDIA.NOW_PLAYING.GENRES.audiobooks." ,
	} ,
	PASSIVE: {
		BASE: "HARD_DRIVE.PASSIVE." ,
	}
};

module.exports.MOPIDY = {
	BASE: "MOPIDY." ,
	STATE: "MOPIDY.STATE" ,
	STATUS: "STATUS.MOPIDY" ,
	NOW_PLAYING: "MOPIDY.NOW_PLAYING" ,
	CONTINUOUS_GENRE: "MOPIDY.CONTINUOUS_GENRE" ,
	GENRES: {
		classic: {
			PLAYLISTS: "MOPIDY.GENERES.CLASSIC.PLAYLISTS" ,
			TRACKS: "MOPIDY.GENRES.CLASSIC.TRACKS" ,
		} ,
		edm: {
			PLAYLISTS: "MOPIDY.GENERES.EDM.PLAYLISTS" ,
			TRACKS: "MOPIDY.GENERES.EDM.TRACKS" ,
		} ,
		relaxing: {
			PLAYLISTS: "MOPIDY.GENERES.RELAXING.PLAYLISTS" ,
			TRACKS: "MOPIDY.GENERES.RELAXING.TRACKS" ,
		} ,
		storytime: {
			PLAYLISTS: "MOPIDY.GENERES.STORYTIME.PLAYLISTS" ,
			TRACKS: "MOPIDY.GENERES.STORYTIME.TRACKS" ,
		} ,
		unknown: {
			PLAYLISTS: "MOPIDY.GENERES.UNKNOWN.PLAYLISTS" ,
			TRACKS: "MOPIDY.GENERES.UNKNOWN.TRACKS" ,
		} ,
	}
};

module.exports.BUTTONS = {
	BASE: "BUTTONS." ,
	STATUS: "STATUS.USB_BUTTONS" ,
};

module.exports.TWITCH = {
	BASE: "TWITCH." ,
	CURRENT_LIVE_WATCHING_USER: "TWITCH.CURRENT_LIVE_WATCHING_USER" ,
	LIVE_USERS: "TWITCH.LIVE_USERS" ,
	LIVE_USERS_INDEX: "TWITCH.LIVE_USERS.INDEX" ,
	WATCHING_USER: "TWITCH.LIVE.WATCHING_USER" ,
	WATCHING_VOD: "TWITCH.VOD.WATCHING_VOD" ,
};


module.exports.STATUS = [
	"STATUS.USB_BUTTONS" ,
	"STATUS.LOCAL_MEDIA" ,
	"STATUS.YOUTUBE.LIVE" ,
	"STATUS.YOUTUBE.STANDARD" ,
	"STATUS.YOUTUBE.CURRATED" ,
	"STATUS.YOUTUBE.RELAX" ,
	"STATUS.YOUTUBE.PLAYLISTS" ,
	"STATUS.TWITCH" ,
	"STATUS.SKYPE" ,
	"STATUS.MOPIDY" ,
	"STATUS.DISCORD" ,
	"STATUS.INSTAGRAM" ,
];

module.exports.LAST_SS = {
	ACTIVE_STATE: "LAST_SS.ACTIVE_STATE" ,
	LOCAL_MEDIA_ACTIVE: "LAST_SS.LOCAL_MEDIA_ACTIVE" ,
	BUTTON: "LAST_SS.BUTTON" ,
	OPTIONS: "LAST_SS.OPTIONS" ,
	FP: "LAST_SS.FP" ,
	MODE: "LAST_SS.MODE" ,
};