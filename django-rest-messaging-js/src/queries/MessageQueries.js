var ajaxRequest = require('./AjaxCsrf');


var MessageQueries = {
	
	// messages
		
	listMessagesInThread: function(threadId, urlGets) {
		if (urlGets) {
			return ajaxRequest(urlGets, 'GET', null);
		} else {
			return ajaxRequest('/messaging/messages/' + threadId + '/list_messages_in_thread/', 'GET', null);
		}
	},
	
	listLastMessagesOfAllThreads: function(urlGets) {
		if (urlGets) {
			return ajaxRequest(urlGets, 'GET', null);
		} else {
			return ajaxRequest('/messaging/messages/', 'GET', null);
		}
	},
	
	postMessage: function(threadId, messageBody) {
		return ajaxRequest('/messaging/messages/' + threadId + '/post_message/', 'POST', {body: messageBody});
	},
	
	// threads
	
	retrieveThread: function(threadId) {
		return ajaxRequest('/messaging/threads/' + threadId + '/', 'GET', null);
	},
	
	createThread: function(threadName, participantsIdsArray) {
		return ajaxRequest('/messaging/threads/', 'POST', {name: threadName, participants: JSON.stringify(participantsIdsArray)});
	},
	
	updateThread: function(threadId, threadName) {
		return ajaxRequest('/messaging/threads/' + threadId + '/', 'PUT', {name: threadName});
	},
	
	addParticipantsToThread: function(threadId, participantsIdsArray) {
		return ajaxRequest('/messaging/threads/' + threadId + '/add_participants/', 'POST', {participants: JSON.stringify(participantsIdsArray)});
	},
	
	removeParticipantFromThread: function(threadId, participantId) {
		return ajaxRequest('/messaging/threads/' + threadId + '/remove_participant/', 'POST', {participant: participantId});
	},
	
	markAsRead: function(threadId) {
		return ajaxRequest('/messaging/threads/' + threadId + '/mark_thread_as_read/', 'POST', {});
	},
	
	// notifications
	
	notificationsChecked: function() {
		return ajaxRequest('/messaging/notifications/check/', 'POST', {});
	},
	
	// centrifuge
	
	getCentrifugeToken: function (){
		return ajaxRequest("/messaging/centrifugo/authentication/", "POST", {});
	},
	
	// authentication status
	
	checkIfAuthenticated: function (){
		return ajaxRequest("/messaging/authentication/", "GET", null);
	},
	
}

module.exports = MessageQueries;