var MessageStore = require('../stores/MessageStore');


var loginListener = function(userId) {
	MessageStore.setLoggedInParticipantId(userId);
}

var logoutListener = function() {
	MessageStore.setLoggedInParticipantId(null);
}

var recipientsListener = function(recipients) {
	// sets the potential participants to the messaging service
	MessageStore.setRecipients(recipients)
}

var listerners = {
	loginListener: loginListener,
	logoutListener: logoutListener,
	recipientsListener: recipientsListener,
}

module.exports = listerners;