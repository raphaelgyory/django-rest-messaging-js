var React = require('react');
var MessageStore = require('../stores/MessageStore');
var MessageQueries = require('../queries/MessageQueries');
var ModuleMixins = require('./ModuleMixins');

var centrifuge;
var channel;
var channelSubscribed = [];
var timer;


var MessagesManager = React.createClass({
	
	mixins: [
         ModuleMixins.LoginMixin,
         ModuleMixins.CurrentThreadMixin,
	],
	
	getDefaultProps: function() {
		return {
			listInterval: 60000,  // we list the messages every 60 seconds if not overriden
	    };
	},
	
	componentDidMount: function() {
		// we check if the user is authenticated
		MessageStore.checkIfAuthenticated();
		// we listen to thread quits
		MessageStore.addThreadQuitListener(this.onThreadQuit);
	},
	
	componentWillUnmount: function() {
		MessageStore.removeThreadQuitListener(this.onThreadQuit);
	},
	
	componentWillUpdate: function(nextProps, nextState) {
		/*
		 * We start to query the API for messages.
		 * This function must be called after the user has logged in.
		 * We check the users's at the rate told by props.listInterval.
		 */

		// if the user is logged in, we launch a timer
		if (nextState.loggedInParticipantId && nextState.loggedInParticipantId != this.state.loggedInParticipantId) {
			// we initialize the data
			this.queryLastMessageOfAllThreads();
			// know we need to know if we have a socket connection
			// if yes, we listen to it
			// if no, we continue with intervall ajax calls
			var errorCallback = this.startTimer;
			this.connectToCentrifugo(errorCallback);
		} else {
			// the user is not connected anymore
			if (this.state.timer){ 
			// we have a timer, we delete it
				this.stopTimer();
			}
			// we have a centrifugo connection, we stop it
			if (false){
				centrifuge.disconnect();
			}
		}
	},
	
	queryLastMessageOfAllThreads: function() {
		// call the store
		MessageStore.queryLastMessageOfAllThreads(null);
	},
	
	startTimer: function() {
		var _this = this;
		timer = setInterval(_this.update, _this.props.listInterval);
	},
	
	stopTimer: function() {
		// we clear the timer
		clearInterval(timer);
	},
	
	connectToCentrifugo: function(successCallback, errorCallback){
		var _this = this;
		MessageQueries.
			getCentrifugeToken().
				done(function(json){
					// we have a valid token!
					// we now want to connect to channels
					// we get the list of the channels we can connect to dynamically in json.channels
					var channels = json.channels;
					_this.initCentrifuge(json.connection_url, json.user, json.timestamp, json.token, json.debug, channels);
					centrifuge.connect();
				}).
				fail(function(json){
					// we have no valid token
					errorCallback(json);
				});
	},
	
	subscribeToChannelMessage: function(channel){
		
		var subscription = centrifuge.subscribe(channel, function(message) {
	    	if (message.data) {
	    		MessageStore.addSingleMessage(message.data);
	    	}
	    });
		channelSubscribed.push([channel, subscription]);
		return subscription;
	},

	subscribeToChannelThread: function(channel){
		var _this = this;
		var subscription = centrifuge.subscribe(channel, function(thread) {
	    	if (thread.data) {
	    		// we subscribe to the channel
	    		_this.subscribeToChannel(thread.data.message_channel_to_connect_to);
	    		// we refresh the last messages
	    		_this.queryLastMessageOfAllThreads();
	    	}
	    });
		return subscription;
	},

	subscribeToChannel: function(channel){
		
		/* We check the channel type */
		if(channel.indexOf("message") > -1) {
			var subscription = this.subscribeToChannelMessage(channel);
		} else if(channel.indexOf("thread") > -1) {
			var subscription = this.subscribeToChannelThread(channel);
		}

	    subscription.on('ready', function() {
	        subscription.presence(function(data) {
	        	// no output
	        });
	    });

	    subscription.on('join', function(message) {
	    	// no output
	    });

	    subscription.on('leave', function(message) {
	    	// no output
	    });
	    
	},
	
	initCentrifuge: function(url, user, timestamp, token, debug, channels){
	    
		centrifuge = new Centrifuge({
	        url: url,
	        user: user,
	        timestamp: timestamp,
	        token: token,
	        debug: debug,
	        // authEndpoint: "/messaging/centrifugo/authorization/", // this is our API custom authorization url
	    });

	    channels = channels;
		var _this = this;
		
		centrifuge.on('connect', function(){
			
			for (var i = 0; i < channels.length; i++) {
			    _this.subscribeToChannel(channels[i]);
			}
		
		});
	    
		centrifuge.on('error', function(error_message) {
			// no output
		});

		centrifuge.on('disconnect', function(e){
			// no output
		});
	},
	
	update: function() {
		// We look for the last messages in all threads
		this.queryLastMessageOfAllThreads();
		// We look for the last messages in the current thread
		if(this.state.currentThread && this.state.currentThread.id){
			MessageStore.queryMessagesInThread(this.state.currentThread.id);
		}
	},
	
	onThreadQuit: function() {
		var threadId = MessageStore.getlastQuitThreadId();
		for (var i = 0; i < channelSubscribed.length; i++) {
		    if(channelSubscribed[i][0].indexOf('messages:'+threadId) > -1){
				//channelSubscribed[i][1].unsubscribe();
		    }
		}
	},
	
	render: function() {
		// The MessageManagers does not display anything.
		return (<span></span>);
	},
	
});

module.exports = MessagesManager;