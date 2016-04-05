jest.dontMock('../../constants/MessageConstants');
jest.dontMock('../../queries/AjaxCsrf');
jest.dontMock('../../queries/MessageQueries');
jest.dontMock('../MessageStore');
jest.dontMock('../../dispatcher/AppDispatcher');
jest.dontMock('../../utils/listeners');
jest.dontMock('jquery')
jest.dontMock('object-assign');
jest.dontMock('keymirror');


function messageJsonResp(results, count, next, previous){
	/*
	 * Mocks a "list" type reponse.
	 */
	return {
		results: results,
		count: count,
		next: next,
		previous: previous,
	};
}

function messageSingleJsonResp(id, body, sender, thread, sent_at){
	/*
	 * Mocks a "retrieve/post/update" type reponse.
	 */
	return {
		id: id,
		body: body,
		sender: sender,
		thread: thread,
		sent_at: sent_at,
	};
}

// messages for testing

var m8 = {
    "id": 8,
    "body": "hi sent by participant 1 in thread 4",
    "sender": 1,
    "thread": 4,
    "sent_at": "2016-12-11T11:57:15.568000",
    "is_notification": true,
    "readers": []
};

var m7 = {
    "id": 7,
    "body": "hi sent by participant 1 in thread 1 #2",
    "sender": 1,
    "thread": 1,
    "sent_at": "2016-12-10T11:57:15.568000",
    "is_notification": true,
    "readers": []
};

var m6 = {
    "id": 6,
    "body": "hi sent by participant 3 in thread 3 #2",
    "sender": 3,
    "thread": 3,
    "sent_at": "2015-12-09T11:57:16.294000",
    "is_notification": true,
    "readers": []
};

var m5 = {
    "id": 5,
    "body": "hi sent by participant 3 in thread 3 #1",
    "sender": 3,
    "thread": 3,
    "sent_at": "2015-12-08T11:57:16.152000",
    "is_notification": false,
    "readers": []
};

var m4 = {
    "id": 4,
    "body": "hi sent by participant 1 in thread 3",
    "sender": 1,
    "thread": 3,
    "sent_at": "2015-12-07T11:57:16.018000",
    "is_notification": false,
    "readers": []
}

var m3 = {
    "id": 3,
    "body": "hi sent by participant 1 in thread 2",
    "sender": 1,
    "thread": 2,
    "sent_at": "2015-12-06T11:57:15.893000",
    "is_notification": true,
    "readers": []
};

var m1 = {
    "id": 1,
    "body": "hi sent by participant 1 in thread 1",
    "sender": 1,
    "thread": 1,
    "sent_at": "2015-12-05T11:57:15.568000",
    "is_notification": true,
    "readers": []
};

describe('MessageStore', function() {
	
	var MessageConstants = require('../../constants/MessageConstants');
	var AppDispatcher;
	var MessageStore;
	var callback;
	var $ = require('jquery');
	var listeners;
	
	beforeEach(function() {
	    AppDispatcher = require('../../dispatcher/AppDispatcher');
	    MessageStore = require('../MessageStore');
	    MessageQueries = require('../../queries/MessageQueries');
	    callback = AppDispatcher.register.mock.calls[0][0];
	    listeners = require('../../utils/listeners');
	});
	
	it('registers a callback with the dispatcher', function() {
	    expect(AppDispatcher.register.mock.calls.length).toBe(1);
	});
	
	it('callbackDispatch', function() {
		/*
		 * This method is used to dispatch the information obtained via async requests.
		 * Here we ensure AppDispatcher.dispatch is called properly. 
		 */
		// we want to be sure the signal handler is called with the provided arguments
		spyOn(AppDispatcher, "dispatch");
		MessageStore.callbackDispatch("foo", "bar");
		expect(AppDispatcher.dispatch).toHaveBeenCalledWith({ actionType: 'foo', data: 'bar' });
		expect(MessageStore.getLastDispatchedAction()).toEqual('foo');
	});
	
	
	/* 
		First part: login status of the user
	*/
	
	//http://127.0.0.1:8000/messaging/js/django-local-webpack/
	
	it('log in and out', function() {
		// by default the user is not logged in
		expect(MessageStore.getLoggedInParticipantId()).toEqual(null);
		// we log in
		spyOn(MessageStore, "callbackDispatch");
		MessageStore.setLoggedInParticipantId(1);
	    expect(MessageStore.getLoggedInParticipantId()).toEqual(1);
	    expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_SET_LOGIN_STATUS, 1);
	    // we log out
	    MessageStore.setLoggedInParticipantId(null);
	    expect(MessageStore.getLoggedInParticipantId()).toEqual(null);
	    expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_SET_LOGIN_STATUS, null);
	});
	
	it('checkIfAuthenticated', function() {
		var deferred = new $.Deferred();
		var mockedJsonResp = {id: 1};
	    var mockedDefered = deferred.resolve(mockedJsonResp);
		
		// we log in
		spyOn(MessageQueries, "checkIfAuthenticated").andReturn(deferred);
		spyOn(MessageStore, "setLoggedInParticipantId");
		MessageStore.checkIfAuthenticated();
	    expect(MessageStore.setLoggedInParticipantId).toHaveBeenCalledWith(mockedJsonResp.id);
	});
	
	
	/* 
		Second part: handling threads and messages
	*/
	
	it('default threads', function() {
		/*
		 * We ensure the current conversation is by default initialized to null or empty values.
		 */ 
		expect(MessageStore.getCurrentThread().id).toEqual(null);
		var current = MessageStore.getCurrentThreadPaginatedMessages("an id");
		expect(current.results).toEqual([]);
		expect(current.count).toEqual(0);
		expect(current.next).toEqual(null);
		expect(current.previous).toEqual(null);
	});
	
	it('queryMessagesInThread', function() {
		// we mock a json response
		var deferred = new $.Deferred();
		var mockedJsonResp = {
	    		foo: "bar"
	    };
	    var mockedDefered = deferred.resolve(mockedJsonResp);
	    
	    // we spy the store to ensure the right methods are called
		spyOn(MessageQueries, "listMessagesInThread").andReturn(deferred);
		spyOn(MessageStore, "setMessagesInThread").andReturn(deferred);
		
		// the actual action we want to perform
	    MessageStore.queryMessagesInThread(1);
	    
	    // we ensure the thread has been updated
	    expect(MessageStore.setMessagesInThread).toHaveBeenCalledWith(mockedJsonResp);
	    // we ensure the right query has been performed to update the thread
	    expect(MessageQueries.listMessagesInThread).toHaveBeenCalledWith(1, undefined);
	    
	    // with a next url to retrieve older messages in the conversation
	    MessageStore.queryMessagesInThread(15, '?page=2');
	    
	    // we ensure the thread has been updated
	    expect(MessageStore.setMessagesInThread).toHaveBeenCalledWith(mockedJsonResp);
	    // we ensure the right query has been performed to update the thread
	    expect(MessageQueries.listMessagesInThread).toHaveBeenCalledWith(15, '?page=2');
	});
		
	it('setMessagesInThread', function() {
		// we set the current thread
		MessageStore.setCurrentThread(3);
		
		// mock actions
		var jsonRespSet = messageJsonResp([m4], 2, '/next/url/123/', '/previous/url/123/');
		var jsonRespAdd = messageJsonResp([m5], 2, '/next/url/456/', '/previous/url/456/');
		
		// spy
		spyOn(MessageStore, "callbackDispatch");
		spyOn(MessageStore, "emitChange");
		
		// we perform the set action on the store
		MessageStore.setMessagesInThread(jsonRespSet);
		
		// we check the spy
		expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_CURRENT_THREAD_UPDATED, jsonRespSet);
	    expect(MessageStore.getCurrentThreadPaginatedMessages()).toEqual(jsonRespSet);
	    
	    // we perform the add action on the store
	    MessageStore.setMessagesInThread(jsonRespAdd);
		expect(MessageStore.getCurrentThreadPaginatedMessages()).toEqual({
			results: [m4, m5],
	    	next: '/next/url/456/',
	    	previous: '/previous/url/456/',
	    	count: 2
	    });
	    
	    // we add a single message
		MessageStore.addSingleMessage(m6);
	    expect(MessageStore.getCurrentThreadPaginatedMessages()).toEqual({
			results: [m4, m5, m6],
	    	next: '/next/url/456/',
	    	previous: '/previous/url/456/',
	    	count: 3
	    });
	    
	    // we cannot push a message that does not belong to the conversation
	    MessageStore.addSingleMessage(m1);
	    // nothing changed
	    expect(MessageStore.getCurrentThreadPaginatedMessages()).toEqual({
			results: [m4, m5, m6],
	    	next: '/next/url/456/',
	    	previous: '/previous/url/456/',
	    	count: 3
	    });
	});
	
	it('setCurrentThread', function() {
		
		var testId = 178;
		
		// we mock a defered json response json response
		var deferred = new $.Deferred();
		var mockedJsonResp = {id: testId, name: "thread name", participans:[1,2,3]};
	    var mockedDefered = deferred.resolve(mockedJsonResp);
	    
	    // we spy the store to ensure the right methods are called
		spyOn(MessageQueries, "retrieveThread").andReturn(deferred);
		spyOn(MessageQueries, "markAsRead");
		spyOn(MessageStore, "_updateCurrentThread");
		
		// the actual action we want to perform
		MessageStore.setCurrentThread(testId);
	    
	    // we ensure the flow is right
	    expect(MessageStore._updateCurrentThread).toHaveBeenCalledWith(mockedJsonResp);
	    expect(MessageQueries.retrieveThread).toHaveBeenCalledWith(testId);
	    expect(MessageQueries.markAsRead).toHaveBeenCalledWith(testId);
	    
	});
	
	it('setCurrentThread prevent double calls', function() {
		
		// we set a thread
		var thread = {id: 15, name: "thread name", participans:[1,2,3]};
		MessageStore._updateCurrentThread(thread);
		
		// we spy the store to ensure the right methods are called
		spyOn(MessageQueries, "retrieveThread");
		spyOn(MessageStore, "_updateCurrentThread");
		spyOn(MessageStore, "queryMessagesInThread");
		
		// the actual action we want to perform
		MessageStore.setCurrentThread(thread.id);
	    
	    // we ensure the flow is right
	    expect(MessageStore._updateCurrentThread).not.toHaveBeenCalled();
	    expect(MessageQueries.retrieveThread).not.toHaveBeenCalled();
	    expect(MessageStore.queryMessagesInThread).not.toHaveBeenCalledWith(thread.id, null);
	});
	
	it('_updateCurrentThread', function() {
	    
		var thread = {id: 15, name: "thread name", participans:[1,2,3]};
		
		// we have no current thread saved in the store
	    expect(MessageStore.getCurrentThread()).not.toEqual(thread);
		
	    // we spy the store to ensure the right methods are called
		spyOn(MessageStore, "callbackDispatch")
		
		// the actual action we want to perform
		MessageStore._updateCurrentThread(thread);
	    
	    // we ensure the flow is right
	    expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_THREAD_INFO_UPDATED, thread);
	    
	    // the current thread has been actualised
	    expect(MessageStore.getCurrentThread()).toEqual(thread);
	    
	});
	
	it('createThread', function() {
	    
		var name = "thread name";
		
		// the thread we want to create
		var deferred = new $.Deferred();
		var thread = {id: 15, name: name, participants:[1,2,3]};
		var mockedDefered = deferred.resolve(thread);
		
		// we spy the store to ensure the right methods are called
		spyOn(MessageQueries, "createThread").andReturn(deferred);
		spyOn(MessageStore, "setCurrentThread");
		
		// we create the thread
		MessageStore.createThread(name, thread.participants)
		
	    // methods called
		expect(MessageQueries.createThread).toHaveBeenCalledWith(name, thread.participants);
	    expect(MessageStore.setCurrentThread).toHaveBeenCalledWith(thread.id);
	    
	});
	
	
	it('addThreadParticipants', function() {
		
		// we set a current thread
		var thread = {id: 1, name: "thread name", participans:[1,2,3]};
		MessageStore._updateCurrentThread(thread);
		
		// we mock a json response
		var deferred = new $.Deferred();
	    var mockedDefered = deferred.resolve(thread);
	    
	    // we spy the store to ensure the right methods are called
		spyOn(MessageQueries, "addParticipantsToThread").andReturn(deferred);
		spyOn(MessageStore, "_updateCurrentThread");
		
		// the actual action we want to perform
		participantsIds = [1,2,3];
		MessageStore.addThreadParticipants(1, participantsIds);
	    
	    // we ensure the threads have been updated
	    expect(MessageQueries.addParticipantsToThread).toHaveBeenCalledWith(1, participantsIds);
	    expect(MessageStore._updateCurrentThread).toHaveBeenCalledWith(thread);
		
	});
	
	it('removeThreadParticipant', function() {
		
		// we set a current thread
		var thread = {id: 1, name: "thread name", participants:[1, 2, 3]};
		MessageStore._updateCurrentThread(thread);
		
		// we mock a json response
		var deferred = new $.Deferred();
	    var mockedDefered = deferred.resolve(thread);
	    
	    // we spy the store to ensure the right methods are called
		spyOn(MessageQueries, "removeParticipantFromThread").andReturn(deferred);
		spyOn(MessageStore, "_updateCurrentThread");
		
		// the actual action we want to perform
		participantsIds = [1,2,3];
		MessageStore.removeThreadParticipant(1, 1);
	    
	    // we ensure the threads have been updated
	    expect(MessageQueries.removeParticipantFromThread).toHaveBeenCalledWith(1, 1);
	    expect(MessageStore._updateCurrentThread).toHaveBeenCalledWith(thread);
		
	});
	
	it('queryLastMessageOfAllThreads', function() {
		
		// we mock a json response
		var deferred = new $.Deferred();
		var mockedJsonResp = {
	    	foo: "bar"
	    };
	    var mockedDefered = deferred.resolve(mockedJsonResp);
	    
	    // we spy the store to ensure the right methods are called
		spyOn(MessageQueries, "listLastMessagesOfAllThreads").andReturn(deferred);
		spyOn(MessageStore, "setLastMessageOfAllThreads").andReturn(deferred);
		
		// the actual action we want to perform
		MessageStore.queryLastMessageOfAllThreads();
	    
	    // we ensure the threads have been updated
	    expect(MessageStore.setLastMessageOfAllThreads).toHaveBeenCalledWith(mockedJsonResp);
	    // we ensure the right query has been performed to update the thread
	    expect(MessageQueries.listLastMessagesOfAllThreads).toHaveBeenCalledWith(undefined);
	    
	    // with a next url to retrieve older messages in the conversation
	    MessageStore.queryLastMessageOfAllThreads('?page=2');
	    // we ensure the thread has been updated
	    expect(MessageStore.setLastMessageOfAllThreads).toHaveBeenCalledWith(mockedJsonResp);
	    // we ensure the right query has been performed to update the thread
	    expect(MessageQueries.listLastMessagesOfAllThreads).toHaveBeenCalledWith('?page=2');
		
	});
	
	it('setLastMessageOfAllThreads addSingleMessage and notificationsChecked', function() {

		// mock data
		var jsonRespSet = messageJsonResp([m5, m3, m1], 3, '/next/url/123/', '/previous/url/123/');
		
		// spy
		spyOn(MessageStore, "callbackDispatch");
		spyOn(MessageStore, "setNotificationsThreadsIds");
		
		// we create the list in the store
		MessageStore.setLastMessageOfAllThreads(jsonRespSet);
	    expect(MessageStore.getLastMessageOfAllThreads()).toEqual(jsonRespSet);
	    // we check the spy
		expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_ALL_THREADS_UPDATED, jsonRespSet);
		expect(MessageStore.setNotificationsThreadsIds).toHaveBeenCalledWith(jsonRespSet);
		
	    // if a new message is published, it is added to its thread and replaces the current last message in this thread
	    MessageStore.addSingleMessage(m6);
	    expect(MessageStore.getLastMessageOfAllThreads()).toEqual(messageJsonResp([m6, m3, m1], 3, '/next/url/123/', '/previous/url/123/'));
	    // we check the spy
		expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_ALL_THREADS_UPDATED, m6);
		
	    // a new message reorders all the threads
	    // here the older thread become the most recent
	    MessageStore.addSingleMessage(m7);
	    expect(MessageStore.getLastMessageOfAllThreads()).toEqual(messageJsonResp([m7, m6, m3], 3, '/next/url/123/', '/previous/url/123/'));
	    
	    // append next set (in case of paginated result)
	    // we reuse the same data set, just modify the thread to ensure we eliminate duplicates
	    var nextJsonRespSet = messageJsonResp([m8], 1, '/next/url/456/', '/previous/url/456/');
	    var expectedSet = {
	    	results: [m8, m7, m6, m3],
	    	count: 1, // last count returned by the backend
	    	next: '/next/url/456/',
	    	previous: '/previous/url/456/',
	    };
	    MessageStore.setLastMessageOfAllThreads(nextJsonRespSet);
	    expect(MessageStore.getLastMessageOfAllThreads()).toEqual(expectedSet);
	    
	    // the method prevents duplicates
	    MessageStore.setLastMessageOfAllThreads(nextJsonRespSet);
	    expect(MessageStore.getLastMessageOfAllThreads()).toEqual(expectedSet);
	});
	
	it('postMessage', function() {
		// we mock a json response
		var deferred = new $.Deferred();
		var mockedJsonResp = messageSingleJsonResp("idFoo", "bodyBar", "senderFoo", "threadBar", "sent_atFoo");
	    var mockedDefered = deferred.resolve(mockedJsonResp);
	    
	    // we spy the store to ensure the right methods are called
		spyOn(MessageQueries, "postMessage").andReturn(deferred);
		spyOn(MessageStore, "addSingleMessage").andReturn(deferred);
		
		// the actual action we want to perform
		// we post
		MessageStore.postMessage("idFoo", "bodyBar");
	    
	    // we ensure the threads have been updated
	    expect(MessageStore.addSingleMessage).toHaveBeenCalledWith(mockedJsonResp);
	    // we ensure the right query has been performed to update the thread
	    expect(MessageQueries.postMessage).toHaveBeenCalledWith("idFoo", "bodyBar");
	    
	});
	
	it('setSingleMessagesInLastThreads', function() {	    
	    // we spy the store to ensure the right methods are called
		spyOn(MessageStore, "callbackDispatch");
		spyOn(MessageStore, "setNotificationsThreadsIds");
		
		// the actual action we want to perform
		MessageStore.setSingleMessagesInLastThreads(m1);
	    
	    // we ensure the threads have been updated
	    expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_ALL_THREADS_UPDATED, m1);
	    
	});
	
	// add / remove people
	
	it('getNotificationsCount setNotificationsThreadsIds', function() {
		// by default, we have zero notifications
		expect(MessageStore.getNotificationsCount()).toEqual(0);
	    
		// we push 2 new messages
		var jsonRespSet = messageJsonResp([m5, m1], 3, '/next/url/123/', '/previous/url/123/');
		
		// spy
		spyOn(MessageStore, "callbackDispatch");
		
		// we perform the set action on the store
		MessageStore.setNotificationsThreadsIds(jsonRespSet);
		
		// we check the spy
		//expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_NOTIFICATIONS_COUNT_UPDATED, jsonRespSet);
	    expect(MessageStore.getNotificationsCount()).toEqual(1); // m1
	    
	    // individual push
	    MessageStore.setNotificationsThreadsIds(m3);
	    //expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_NOTIFICATIONS_COUNT_UPDATED, m3);
	    expect(MessageStore.getNotificationsCount()).toEqual(2); // m1 ad m3
	    
	    // messages beloging to the same conversation are fitered
	    MessageStore.setNotificationsThreadsIds(m7);
	    //expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_NOTIFICATIONS_COUNT_UPDATED, m3);
	    expect(MessageStore.getNotificationsCount()).toEqual(2); // not updated because m1 and m7 belon to the same thread
	    
	});
	
	it('setNotificationsThreadId callback', function() {
		// we ensure setNotificationsCount is called when MessageConstants.MESSAGES_ALL_THREADS_UPDATED is sent
		expect(MessageStore.getNotificationsCount()).toEqual(0);
		var jsonRespSet = messageJsonResp([m5, m3, m1], 3, '/next/url/123/', '/previous/url/123/');
		// using the store callback triggers a Dispatch in middle of Dispatch error
		// and creating a separate store for the notifications only is overhead for now
		// var payload = { actionType: MessageConstants.MESSAGES_ALL_THREADS_UPDATED, data: jsonRespSet };
		// callback(payload);
		MessageStore.setNotificationsThreadsIds(jsonRespSet);
		expect(MessageStore.getNotificationsCount()).toEqual(2);
	});
	
	it('notificationsChecked', function() {
		
		// we set notifications
		var jsonRespSet = messageJsonResp([m5, m3, m1], 3, '/next/url/123/', '/previous/url/123/');
		MessageStore.setNotificationsThreadsIds(jsonRespSet);
		expect(MessageStore.getNotificationsCount()).toEqual(2); // m1 ad m3
		
		// we mock a json response
		var deferred = new $.Deferred();
		var mockedJsonResp = {
	    		foo: "bar"
	    };
	    var mockedDefered = deferred.resolve(mockedJsonResp);
		
		// we create a function to count the number of notifications in a messages set
		function countNofitications(messages){
			var count = 0;
			for (var i = 0; i < messages.length; i++) {
				if(messages[i].is_notification == true){
			    	count = count + 1;
			    }
			}
			return count;
		}
		
		// this is not best pratcie to test stores (test depending direclty on MessageStore.setLastMessageOfAllThreads, which is not tested)
		// ideally we should register a callback as stated here: https://facebook.github.io/react/blog/2014/09/24/testing-flux-applications.html#testing-stores
		// as done in it('setNotificationsThreadId callback') above
		// but we have not registered any populating method with the dispatcher
		// so we populated the sotre direclty through the method
		
		// we populate and retrieve all the threads and count the notifications
		MessageStore.setLastMessageOfAllThreads(jsonRespSet);
		var allThreads = MessageStore.getLastMessageOfAllThreads();
		expect(countNofitications(allThreads.results)).toEqual(2); // m1 and m3
		
		// we populate and retrieve the current thread
		MessageStore.queryMessagesInThread(1)
		MessageStore.setMessagesInThread(messageJsonResp([m1], 1, '/next/url/456/', '/previous/url/123/'));
		var currentThread = MessageStore.getCurrentThreadPaginatedMessages(m1.thread);
		expect(countNofitications(currentThread.results)).toEqual(1); // m1
		 
	    // we spy the store to ensure the right methods are called
		spyOn(MessageQueries, "notificationsChecked").andReturn(deferred);
		spyOn(MessageStore, "callbackDispatch").andReturn(deferred);
		
		MessageStore.notificationsChecked();
		expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_CURRENT_THREAD_UPDATED, currentThread);
		expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_ALL_THREADS_UPDATED, allThreads);
		
		// we can now iterate through all the messages and should get no notifications
		var currentThread = MessageStore.getCurrentThreadPaginatedMessages(m1.thread);
		var allThreads = MessageStore.getLastMessageOfAllThreads();
		expect(countNofitications(currentThread.results)).toEqual(0);
		expect(countNofitications(allThreads.results)).toEqual(0);
		
		// the store returns 0 too
		expect(MessageStore.getNotificationsCount()).toEqual(0);
		
	});
	
	it('getRecipients setRecipients', function() {
		// we have no recipients to start with
		expect(MessageStore.getRecipients()).toEqual([]);
		// we spy
		spyOn(MessageStore, "callbackDispatch");
		// we set
		var recipients = ['foo', 'bar'];
		MessageStore.setRecipients(recipients);
		// test
		expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_POTENTIAL_RECIPIENTS_UPDATED, recipients);
		expect(MessageStore.getRecipients()).toEqual(recipients);
		// the listener
		spyOn(MessageStore, "setRecipients");
		var otherRecipients = ['hi', 'hello'];
		listeners.recipientsListener(otherRecipients);
		expect(MessageStore.setRecipients).toHaveBeenCalledWith(otherRecipients);
	});
	
	it('quitThread', function() {
		
		var thread = 2;
		var jsonRespSet = messageJsonResp([m3], 1, '/next/url/123/', '/previous/url/123/');
		
		// we set a thread with messages
		MessageStore.setCurrentThread(thread);
		MessageStore.setMessagesInThread(jsonRespSet);
		MessageStore.setLastMessageOfAllThreads(jsonRespSet);
		
		// we ensure the setup is right
		expect(MessageStore.getCurrentThread()).toEqual({
	    	id: thread,
	    	name: null,
	    	participants: [],
	    });
	    
	    expect(MessageStore.getCurrentThreadPaginatedMessages()).toEqual(jsonRespSet)
		expect(MessageStore.getLastMessageOfAllThreads()).toEqual(jsonRespSet);
	    
		// spy
		spyOn(MessageStore, "callbackDispatch");
		spyOn(MessageStore, "emitChange");
		
		// we mock a defered json response json response
		var deferred = new $.Deferred();
		var mockedJsonResp = "foo";
	    var mockedDefered = deferred.resolve(mockedJsonResp);
	    
	    // we spy the store to ensure the right methods are called
		spyOn(MessageQueries, "removeParticipantFromThread").andReturn(deferred);
		
		// we quit the thread
		MessageStore.quitCurrentThread(thread);
	    
	    // updated values
	    var newCurrentThread = {
	    	id: null,
	    	name: null,
	    	participants: [],
	    };
	    
	    var newCurrentThreadPaginatedMessages = {
	    	results: [],
	    	next: null,
	    	previous: null,
	    	count: 0
	    };
	    
	    var newLastMessageOfAllThreadsPaginated = {
    		results: [],
    		next: '/next/url/123/', // did not change
    		previous: '/previous/url/123/',
    		count: 0
    	};
	    
	    // the thread has been cleaned
	    expect(MessageStore.getCurrentThread()).toEqual(newCurrentThread);
	    expect(MessageStore.getCurrentThreadPaginatedMessages()).toEqual(newCurrentThreadPaginatedMessages);
	    expect(MessageStore.getLastMessageOfAllThreads()).toEqual(newLastMessageOfAllThreadsPaginated);
	    
	    
	    expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_THREAD_INFO_UPDATED, newCurrentThread);
	    expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_CURRENT_THREAD_UPDATED, newCurrentThreadPaginatedMessages);
		expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_ALL_THREADS_UPDATED, newLastMessageOfAllThreadsPaginated);
		expect(MessageStore.callbackDispatch).toHaveBeenCalledWith(MessageConstants.MESSAGES_THREAT_QUIT, thread);
	    
	});
	
});
