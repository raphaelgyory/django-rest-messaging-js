jest.dontMock('../../queries/AjaxCsrf');
jest.dontMock('../../queries/MessageQueries');
jest.dontMock('object-assign');

describe('MessageQueries', function() {
	
	var $ = require('jquery');
	var MessageQueries = require('../../queries/MessageQueries');
	var ajaxRequest = require('../AjaxCsrf')
	
	// this builds a function the same way our ajaxRequest does it
	function ajaxParams(url, type, data){
		return {
	        url: url,
	        type: type,
	        dataType: "json",
	        contentType: "application/json",
	        data: JSON.stringify(data),
	        // The ``X-CSRFToken`` evidently can't be set in the
	        // ``headers`` option, so force it here.
	        beforeSend: jasmine.any(Function)
		}
	}
	
	// messages
	
	it('listMessagesInThread', function() {
		// we ensure the query was properly called
		MessageQueries.listMessagesInThread(1);
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/messages/1/list_messages_in_thread/', 'GET', null));
	});
	
	it('listLastMessagesOfAllThreads', function() {
		// we ensure the query was properly called
		MessageQueries.listLastMessagesOfAllThreads();
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/messages/', 'GET', null));
	});
	
	it('postMessage', function() {
		// we ensure the query was properly called
		MessageQueries.postMessage(1, "body of the message");
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/messages/1/post_message/', 'POST', {body: "body of the message"}));
	});
	
	// threads
	
	it('retrieveThread', function() {
		// we ensure the query was properly called
		MessageQueries.retrieveThread(1);
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/threads/1/', 'GET', null));
	});
	
	it('createThread', function() {
		// we ensure the query was properly called
		MessageQueries.createThread("name of the thread (may be undefined)");
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/threads/', 'POST', {name: "name of the thread (may be undefined)"}));
	});
	
	it('updateThread', function() {
		// we ensure the query was properly called
		MessageQueries.updateThread(1, "name of the thread (may be undefined)");
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/threads/1/', 'PUT', {name: "name of the thread (may be undefined)"}));
	});
	
	it('addParticipantsToThread', function() {
		// we ensure the query was properly called
		MessageQueries.addParticipantsToThread(1, [1, 2, 3]); // thread 1 participants 1, 2 and 3
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/threads/1/add_participants/', 'POST', {participants: JSON.stringify([1, 2, 3])}));
	});
	
	it('removeParticipantFromThread', function() {
		// we ensure the query was properly called
		MessageQueries.removeParticipantFromThread(1, 1);  // thread 1 participant 1
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/threads/1/remove_participant/', 'POST', {participant: 1}));
	});
	
	it('markAsRead', function() {
		// we ensure the query was properly called
		MessageQueries.markAsRead(1);  // thread 1
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/threads/1/mark_thread_as_read/', 'POST', {}));
	});
	
	// notifications
	
	it('notificationsChecked', function() {
		// we ensure the query was properly called
		MessageQueries.notificationsChecked();
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/notifications/check/', 'POST', {}));
	});
	
	// centrifuge
	
	it('getCentrifugeToken', function() {
		// we ensure the query was properly called
		MessageQueries.getCentrifugeToken();
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/centrifugo/authentication/', 'POST', {}));
	});
	
	// auth
	
	it('checkIfAuthenticated', function() {
		// we ensure the query was properly called
		MessageQueries.checkIfAuthenticated();
		expect($.ajax).toBeCalledWith(ajaxParams('/messaging/authentication/', 'GET', null));
	});

	
	
});
