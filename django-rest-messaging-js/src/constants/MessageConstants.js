var keyMirror = require('keymirror');

// We list the actions that can be performed through stores

module.exports = keyMirror({
	MESSAGES_SET_LOGIN_STATUS: null,
	MESSAGES_CURRENT_THREAD_UPDATED: null,
	MESSAGES_ALL_THREADS_UPDATED: null,
	MESSAGES_ONE_THREAD_UPDATED: null,
	MESSAGES_NOTIFICATIONS_COUNT_UPDATED: null,
	MESSAGES_THREAD_INFO_UPDATED: null, // thread info itself (name, participants, etc.)
	MESSAGES_POTENTIAL_RECIPIENTS_UPDATED: null,
	MESSAGES_NEW_THREAD_FORM_UPDATED: null,
	MESSAGES_THREAT_QUIT: null,
});
