var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var MessageConstants = require('../constants/MessageConstants');
var MessageQueries = require('../queries/MessageQueries');
var $ = require('jquery');


// the user's login status
var _loggedInParticipantId = null;

// the info about the thread (name, participants, etc)
var _currentThreadEmpty = {
	id: null,
	name: null,
	participants: [],
};

var _currentThread = $.extend(true, {}, _currentThreadEmpty);

// the user's messages FOR THE CURRENT THREAD
// this is a json response which is paginated
var _currentThreadPaginatedMessagesEmpty = {
	results: [],
	next: null,
	previous: null,
	count: 0
};

var _currentThreadPaginatedMessages =  $.extend(true, {}, _currentThreadPaginatedMessagesEmpty);  // we clone without assignment

// the user's threads
var _lastMessageOfAllThreadsPaginated = {
	results: [],
	next: null,
	previous: null,
	count: 0
};

// the notifications count
var _notificationsThreadsIds = [];

// we keep track of the last emit for testing purpose
var _lastEmit;

// we keep track of the last dispatched action for testing purpose
var _lastDispatchedAction;

// we track information about temporary threads when created
var _threadsForm = null;

// we track the potential recipients
var _recipients = [];

// we track the last quit thread
var _lastQuitThreadId = null;

// Extend ProductStore with EventEmitter to add eventing capabilities
var MessageStore = assign({}, EventEmitter.prototype, {
	
	/* 
		First part: login status of the user
	*/
	
	getLoggedInParticipantId: function() {
		/*
		 * Returns the id of the user/participant if he is logged in, null otherwise.
		 */
		return _loggedInParticipantId;
	},
	
	setLoggedInParticipantId: function(userId) {
		/*
		 * Sets _LoggedInParticipantId to the provided id and emits a change.
		 */
		
		// we change the status
		_loggedInParticipantId = userId;
		this.callbackDispatch(MessageConstants.MESSAGES_SET_LOGIN_STATUS, userId);
	},
	
	checkIfAuthenticated: function() {
		var _this = this;
		MessageQueries.
			checkIfAuthenticated().
			done(function(participant){
				_this.setLoggedInParticipantId(participant.id);
			});
	},
	
	addLoginStatusChangeListener: function(callback) {
		/*
		 * This can be used by our components to modify their state when they mount.
		 */
		this.on(MessageConstants.MESSAGES_SET_LOGIN_STATUS, callback);
	},

	removeLoginStatusChangeListener: function(callback) {
		/*
		 * This can be used by our components to modify their state when they unmount.
		 */
		this.removeListener(MessageConstants.MESSAGES_SET_LOGIN_STATUS, callback);
	},
	
	/* 
		Second part: handling threads and messages
	*/
	
	getCurrentThread: function() {
		/*
		 * We return the current thread.
		 */
		return _currentThread;
	},
	
	_updateCurrentThread: function(thread) {
		/*
		 * We set the current thread.
		 */
		// we update the thread
		_currentThread = thread;
		// we emit
		this.callbackDispatch(MessageConstants.MESSAGES_THREAD_INFO_UPDATED, thread);
	},
	
	setCurrentThread: function(threadId) {
		/*
		 * We set the current thread's id.
		 */
		var _this = this;

		if (this.getCurrentThread().id != threadId){
			// we update the thread
			_currentThread.id = threadId;
			_currentThreadPaginatedMessages = $.extend(true, {}, _currentThreadPaginatedMessagesEmpty);  // we clone without assignment
			// we query its content
			MessageQueries.
				retrieveThread(threadId).
				done(function(thread){
					_this._updateCurrentThread(thread);
					_this.queryMessagesInThread(thread.id, null);
					// we mark it as read
					MessageQueries.markAsRead(thread.id);
				});
		}
	},
	
	initializeNewThread: function() {
		/*
		 * We set the current thread's id.
		 */
		var _this = this;
		_currentThread = $.extend(true, {}, _currentThreadEmpty);
		_currentThread.id = 0;
		_currentThreadPaginatedMessages = $.extend(true, {}, _currentThreadPaginatedMessagesEmpty);  // we clone without assignment
		this.callbackDispatch(MessageConstants.MESSAGES_THREAD_INFO_UPDATED, _currentThread);
		this.callbackDispatch(MessageConstants.MESSAGES_CURRENT_THREAD_UPDATED, _currentThreadPaginatedMessages);
	},
	
	createThread: function(threadName, participantsIdsArray) {
		var _this = this;
		return MessageQueries.
			createThread(threadName, participantsIdsArray).
			done(function(thread){
				_this.setCurrentThread(thread.id);
			});
	},
	
	addThreadParticipants: function(threadId, participantsIds) {
		var _this = this;
		MessageQueries.
			addParticipantsToThread(threadId, participantsIds).
			done(function(thread){
				// if the thread is the current one, we update
				if (thread.id == _this.getCurrentThread().id){
					_this._updateCurrentThread(thread);
				}
			});
	},
	
	removeThreadParticipant: function(threadId, participantId) {
		var _this = this;
		MessageQueries.
			removeParticipantFromThread(threadId, participantId).
			done(function(thread){
				if (thread.id == _this.getCurrentThread().id){
					_this._updateCurrentThread(thread);
				}
			});
	},
	
	getCurrentThreadPaginatedMessages: function() {
		/*
		 * We return the current thread with its messages
		 */
		return _currentThreadPaginatedMessages;
	},
	
	queryMessagesInThread: function(threadId, nextUrl) {
		/*
		 * The user gets a new thread, we must query the messages in this thread.
		 * var nextUrl is the url returned by Django's paginator.
		 */
		var _this = this;
		// we query the messages
		MessageQueries.
			listMessagesInThread(threadId, nextUrl).
			done(function(jsonResponse){
				_this.setMessagesInThread(jsonResponse);
			});
	},
	
	_handleMessagesResults: function(currentMessages, newMessages, sortOrder) {
		/*
		 * Adding two sets of messages.
		 */
		// we get all the ids of the current messages
		var currentMessagesIds = currentMessages.map(function(message) {return message.id; })
		
		// we ensure we have current messages
		if (currentMessages && currentMessages.length > 0){
			// we add the new messages if they are not duplicates
			$.each(newMessages, function(index, message){
			    if($.inArray(message.id, currentMessagesIds) === -1) currentMessages.push(message);
			});
		} else {
			currentMessages = newMessages;
		}
		
		// we sort the messages by date
		if (sortOrder == "ascending") {
			return currentMessages.sort(function(m1,m2){ 
				return (m1.id > m2.id);
			});
		} else {
			return currentMessages.sort(function(m1,m2){ 
				return (m1.id < m2.id);
			});
		}
		
	},
	
	setMessagesInThread: function(jsonResponse) {
		/*
		 * This methods adds messages to the current Thread.
		 * If messages are already present, the new one are simply added.
		 */
		
		// we set the current messages
		_currentThreadPaginatedMessages.results = this._handleMessagesResults(_currentThreadPaginatedMessages.results, jsonResponse.results, 'ascending');
		_currentThreadPaginatedMessages.next = jsonResponse.next;
		_currentThreadPaginatedMessages.previous = jsonResponse.previous;
		_currentThreadPaginatedMessages.count = jsonResponse.count;
		
		// we emit
		this.callbackDispatch(MessageConstants.MESSAGES_CURRENT_THREAD_UPDATED, jsonResponse)
	},
	
	setSingleMessagesInThread: function(message) {
		/*
		 * This methods adds messages to the current Thread.
		 * Usually single messages are pushed via sockets.
		 */
		// we add the message to the current conversation
		// we also check it is not already in it (may happen when using centrifuge since the message is posted to the channel)
		var currentMessagesIds = _currentThreadPaginatedMessages.results.map(function(message, index){
			return message.id;
		});
		
		if(message.thread == this.getCurrentThread().id && $.inArray(message.id, currentMessagesIds) === -1){
			_currentThreadPaginatedMessages.results.push(message);
			_currentThreadPaginatedMessages.count = _currentThreadPaginatedMessages.count + 1;
		}
		
		// we emit
		this.callbackDispatch(MessageConstants.MESSAGES_CURRENT_THREAD_UPDATED, message)
	},
	
	addThreadInfoChangeListener: function(callback) {
		/*
		 * This can be used by our components to modify their state when they mount.
		 */
		this.on(MessageConstants.MESSAGES_THREAD_INFO_UPDATED, callback);
	},

	removeThreadInfoChangeListener: function(callback) {
		/*
		 * This can be used by our components to modify their state when they unmount.
		 */
		this.removeListener(MessageConstants.MESSAGES_THREAD_INFO_UPDATED, callback);
	},
	
	addThreadChangeListener: function(callback) {
		/*
		 * This can be used by our components to modify their state when they mount.
		 */
		this.on(MessageConstants.MESSAGES_CURRENT_THREAD_UPDATED, callback);
	},

	removeThreadChangeListener: function(callback) {
		/*
		 * This can be used by our components to modify their state when they unmount.
		 */
		this.removeListener(MessageConstants.MESSAGES_CURRENT_THREAD_UPDATED, callback);
	},
	
	getLastMessageOfAllThreads: function() {
		/*
		 * We return the current thread with its messages
		 */
		return _lastMessageOfAllThreadsPaginated;
	},
	
	queryLastMessageOfAllThreads: function(nextUrl) {
		/*
		 * We return the current thread with its messages
		 */
		var _this = this;
		
		MessageQueries.
			listLastMessagesOfAllThreads(nextUrl).
			done(function(jsonResponse){
				// we set the current messages
				_this.setLastMessageOfAllThreads(jsonResponse);
			});
	},
	
	setLastMessageOfAllThreads: function(jsonResponse) {
		/*
		 * We set the list of the threads with all messages
		 */
		_lastMessageOfAllThreadsPaginated.results =  this._handleMessagesResults(_lastMessageOfAllThreadsPaginated.results, jsonResponse.results, 'descending');
		_lastMessageOfAllThreadsPaginated.next = jsonResponse.next;
		_lastMessageOfAllThreadsPaginated.previous = jsonResponse.previous;
		_lastMessageOfAllThreadsPaginated.count = jsonResponse.count;
		
		// we check the notifications
		this.setNotificationsThreadsIds(_lastMessageOfAllThreadsPaginated);
		
		// we dispatch
		this.callbackDispatch(MessageConstants.MESSAGES_ALL_THREADS_UPDATED, jsonResponse)
	},
	
	setSingleMessagesInLastThreads: function(message) {
		/*
		 * This methods adds a single message to the list of all thread (being the last entry, it closes the thread).
		 * Usually single messages are pushed via sockets.
		 */
		
		// we add the message to the current conversation
		for (var i = 0; i < _lastMessageOfAllThreadsPaginated.results.length; i++) {
		    if(_lastMessageOfAllThreadsPaginated.results[i].thread == message.thread) {
		    	// replace and reorder list
		    	message.readers = []; // no one has read it yet
		    	_lastMessageOfAllThreadsPaginated.results[_lastMessageOfAllThreadsPaginated.results.indexOf(_lastMessageOfAllThreadsPaginated.results[i])] = message;
		    	_lastMessageOfAllThreadsPaginated.results.sort(function(a,b){
		    		  return (a.id < b.id);
		    	});
		    }
		}
		
		// we check the notifications
		this.setNotificationsThreadsIds(_lastMessageOfAllThreadsPaginated);
		
		// we dispacth
		this.callbackDispatch(MessageConstants.MESSAGES_ALL_THREADS_UPDATED, message)
	},
	
	addLastMessageOfAllThreadsChangeListener: function(callback) {
		/*
		 * This can be used by our components to modify their state when they mount.
		 */
		this.on(MessageConstants.MESSAGES_ALL_THREADS_UPDATED, callback);
	},

	removeLastMessageOfAllThreadsChangeListener: function(callback) {
		/*
		 * This can be used by our components to modify their state when they unmount.
		 */
		this.removeListener(MessageConstants.MESSAGES_ALL_THREADS_UPDATED, callback);
	},
	
	addSingleMessage: function(message) {
		/*
		 * We only have one message, we append it to the thread list and to it's conversation if it is currently featured.
		 * This function is used when messages are added using sockets.
		 */
		// we add it to the current conversation
		this.setSingleMessagesInThread(message);
		this.setSingleMessagesInLastThreads(message);
		// we do not emit anything, this is done in the corresponding functions
	},
	
	postMessage: function(threadId, messageBody) {
		/*
		 * Post  message and add it to the conversation.
		 */
		_this = this;
		
		return MessageQueries.postMessage(threadId, messageBody)
			.done(function(jsonResponse){
				_this.addSingleMessage(jsonResponse);
			});
	},
	
	// chain thread and message form
	
	getThreadForm: function(){
		return _threadsForm;
	},
	
	setThreadForm: function(threadsForm) {
		_threadsForm = threadsForm;
		this.callbackDispatch(MessageConstants.MESSAGES_NEW_THREAD_FORM_UPDATED, threadsForm);
	},
	
	submitThreadForm: function() {
		return _threadsForm.saveThreadWithRecipients();
	},
	
	addNewThreadFormChangeListener: function(callback) {
		/*
		 * This can be used by our components to modify their state when they mount.
		 */
		this.on(MessageConstants.MESSAGES_NEW_THREAD_FORM_UPDATED, callback);
	},

	removeNewThreadFormChangeListener: function(callback) {
		/*
		 * This can be used by our components to modify their state when they unmount.
		 */
		this.removeListener(MessageConstants.MESSAGES_NEW_THREAD_FORM_UPDATED, callback);
	},
	
	/*
	  	Notifications
	*/
	
	getNotificationsCount: function() {
		return _notificationsThreadsIds.length;
	},
	
	_pushToNotificationsThreadsIds: function(message) {
		// we do not allow duplicates
		// we ensure the message is not posted by the current participant
		if ( _notificationsThreadsIds.indexOf(message.thread) == -1 
				&& message.sender != this.getLoggedInParticipantId()
		) {
			_notificationsThreadsIds.push(message.thread);
		}
		
	},
	
	setNotificationsThreadsIds: function(messagesArrayOrInstance) {
		/*
		 * Sets the notification count. 
		 * Should be called when MessageConstants.MESSAGES_ALL_THREADS_UPDATED is used.
		 */
		
		// we ensure the message has is_notification set as true
		// the python backends cares for determining when is_notification should be true (ie: not written by the current user etc.)
				
		if(messagesArrayOrInstance.hasOwnProperty('results')){ // we have an array
			// we try to add every notification
			for (var i = 0; i < messagesArrayOrInstance.results.length; i++) {
			    if(messagesArrayOrInstance.results[i].is_notification == true && messagesArrayOrInstance.results[i].sender != this.getLoggedInParticipantId()){
			    	this._pushToNotificationsThreadsIds(messagesArrayOrInstance.results[i]);
			    }
			}
			
		} else if(messagesArrayOrInstance.hasOwnProperty('is_notification') && messagesArrayOrInstance.is_notification == true && messagesArrayOrInstance.sender != this.getLoggedInParticipantId()) {
			this._pushToNotificationsThreadsIds(messagesArrayOrInstance);
		}
		
	},
	
	_removeNotificationStatus: function(message) {
		/*
		 * Marks notifications as checked.
		 */
		message.is_notification = false;
	},
	
	_iterateAllMessagesWithNotificationStatus: function(messageArray) {
		/*
		 * Iterate through all messages with the is_notification attribute.
		 * Returns true if the is_notification attribute of at least one message has been set to false.
		 */
		var modified = false;
		for (var i = 0; i < messageArray.length; i++) {
		    if(messageArray[i].is_notification == true){
		    	this._removeNotificationStatus(messageArray[i]);
		    	modified = true;
		    }
		}
		return modified;	
	},
	
	notificationsChecked: function() {
		/*
		 * Tells the notifications are checked.
		 * Tells _currentThreadPaginatedMessagesEmpty and _currentThreadPaginatedMessages about it.
		 */
		_this = this;
		
		return MessageQueries.
			notificationsChecked().
			done(function(jsonResponse){
				// we mark the conversations as non notification
				
				// we check if there are modifications in the current thread before re-parsing it
				var notificationsRemovedFromCurrentThread = _this._iterateAllMessagesWithNotificationStatus(_currentThreadPaginatedMessages.results);
				if(notificationsRemovedFromCurrentThread == true) {
					// the current thread has been modified,
					// we dispatch it
					_this.callbackDispatch(MessageConstants.MESSAGES_CURRENT_THREAD_UPDATED, _currentThreadPaginatedMessages)
				}
				
				// we check if there are modifications to the last messages of all thread before re-parsing it
				var notificationsRemovedFromAllThreads = _this._iterateAllMessagesWithNotificationStatus(_lastMessageOfAllThreadsPaginated.results);
				if(notificationsRemovedFromAllThreads == true) {
					// the current thread has been modified,
					// we dispatch it
					_this.callbackDispatch(MessageConstants.MESSAGES_ALL_THREADS_UPDATED, _lastMessageOfAllThreadsPaginated);
				}
				
				// reinitialize
				_notificationsThreadsIds = [];
			});
		
	},
	
	getRecipients: function(recipients) {
		return _recipients;
	},
	
	setRecipients: function(recipients) {
		_recipients = recipients;
		this.callbackDispatch(MessageConstants.MESSAGES_POTENTIAL_RECIPIENTS_UPDATED, recipients);
	},
	
	addRecipientsListener: function(callback) {
		this.on(MessageConstants.MESSAGES_POTENTIAL_RECIPIENTS_UPDATED, callback);
	},

	removeRecipientsListener: function(callback) {
		this.removeListener(MessageConstants.MESSAGES_POTENTIAL_RECIPIENTS_UPDATED, callback);
	},
	
	getlastQuitThreadId: function(){
		return _lastQuitThreadId;
	},
	
	quitCurrentThread: function(threadId) {
		/*
		 * Tells the notifications are checked.
		 * Tells _currentThreadPaginatedMessagesEmpty and _currentThreadPaginatedMessages about it.
		 */
		
		if(! threadId){
			return;
		}
		
		_this = this;
		
		return MessageQueries.
			removeParticipantFromThread(threadId, this.getLoggedInParticipantId()).
			done(function(jsonResponse){
				// we have no current hread anymore
				_currentThread = $.extend(true, {}, _currentThreadEmpty);
				_currentThreadPaginatedMessages = $.extend(true, {}, _currentThreadPaginatedMessagesEmpty);  // we clone without assignment
				
				// we remove the thread from the list
				var index = null;
				
				for (var i = 0; i < _lastMessageOfAllThreadsPaginated.results.length; i++) {
				    if(_lastMessageOfAllThreadsPaginated.results[i].thread == threadId){
				    	index = _lastMessageOfAllThreadsPaginated.results.indexOf(_lastMessageOfAllThreadsPaginated.results[i]);
				    	break;
				    }
				}
				
				if(index != null){
					_lastMessageOfAllThreadsPaginated.results.splice(index, 1);
					_lastMessageOfAllThreadsPaginated.count = _lastMessageOfAllThreadsPaginated.count - 1;
				}
				
				// we mark the thread as quit
				_lastQuitThreadId = threadId
				
				// we dispatch
				_this.callbackDispatch(MessageConstants.MESSAGES_THREAD_INFO_UPDATED, _currentThread);
				_this.callbackDispatch(MessageConstants.MESSAGES_CURRENT_THREAD_UPDATED, _currentThreadPaginatedMessages);
				_this.callbackDispatch(MessageConstants.MESSAGES_ALL_THREADS_UPDATED, _lastMessageOfAllThreadsPaginated);
				_this.callbackDispatch(MessageConstants.MESSAGES_THREAT_QUIT, threadId);
			});
		
	},
	
	addThreadQuitListener: function(callback) {
		this.on(MessageConstants.MESSAGES_THREAT_QUIT, callback);
	},

	removeThreadQuitListener: function(callback) {
		this.removeListener(MessageConstants.MESSAGES_THREAT_QUIT, callback);
	},
	
	/*
		Emit change
	*/
	
	emitChange: function(constant) {
		/*
		 * We emit a change for the specified action.
		 */
		this.emit(constant);
		this.setLastEmit(constant);
	},
	
	/*
		Small helpers used for testing emit and dispacth events. 
	*/
	
	getLastEmit: function(){
		return _lastEmit;
	},
	
	setLastEmit: function(action){
		_lastEmit = action;
	},
	
	getLastDispatchedAction: function(){
		return _lastDispatchedAction;
	},
	
	setLastDispatchedAction: function(action){
		_lastDispatchedAction = action;
	},
	
	/*
		Dispatch
	 */
	callbackDispatch: function(actionType, data) {
		/*
		 * Callback used to interract with the dispatcher (handy after an async call).
		 */
		// we dispatch
		AppDispatcher.dispatch({
			actionType: actionType,
			data: data
		});
		// we keep track of the last dispatched action
		// this helps us essentialy for testing
		this.setLastDispatchedAction(actionType);
		
		// we emit
		this.emitChange(actionType);
	}
});


MessageStore.dispatchToken = AppDispatcher.register(function(action) {
	
	switch(action.actionType) {
	
    	case MessageConstants.MESSAGES_SET_LOGIN_STATUS:
    		break;
    	
    	default:
    		return true;
	}

	return true;

});


module.exports = MessageStore;