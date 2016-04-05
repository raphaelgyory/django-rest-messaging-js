var React = require('react');
var MessageStore = require('../stores/MessageStore');


var LoginMixin = {
	
	getInitialState: function() {
		return {
			loggedInParticipantId: MessageStore.getLoggedInParticipantId(),
		}
	},
	
	componentDidMount: function() {
		MessageStore.addLoginStatusChangeListener(this.onChangeAuth);
	},

	componentWillUnmount: function() {
		MessageStore.removeLoginStatusChangeListener(this.onChangeAuth);
	},
	
	onChangeAuth: function() {
		this.setState({
			loggedInParticipantId: MessageStore.getLoggedInParticipantId(),
		});
	},
}

var CurrentThreadMixin = {
		
	getInitialState: function() {
		return {
			currentThread: MessageStore.getCurrentThread(),
		}
	},
	
	componentDidMount: function() {
		MessageStore.addThreadInfoChangeListener(this.onChangeThread);
	},
	
	componentWillUnmount: function() {
		MessageStore.removeThreadInfoChangeListener(this.onChangeThread);
	},
	
	onChangeThread: function() {
		this.setState({
			currentThread: MessageStore.getCurrentThread(),
		});
	},
}

var NewThreadFormMixin = {
		
	getInitialState: function() {
		return {
			newthreadForm: MessageStore.getThreadForm(),
		}
	},
	
	componentDidMount: function() {
		MessageStore.addNewThreadFormChangeListener(this.onChangeThreadForm);
	},
	
	componentWillUnmount: function() {
		MessageStore.removeNewThreadFormChangeListener(this.onChangeThreadForm);
	},
	
	onChangeThreadForm: function() {
		this.setState({
			newthreadForm: MessageStore.getThreadForm(),
		});
	},
}

var MessagesResultSetMixin = {
		
	getInitialState: function() {
		return {
			messagesResultSet: MessageStore.getCurrentThreadPaginatedMessages(),
		}
	},
	
	componentDidMount: function() {
		MessageStore.addThreadChangeListener(this.onChangeMessageList);
	},
	
	componentWillUnmount: function() {
		MessageStore.addThreadChangeListener(this.onChangeMessageList);
	},
	
	onChangeMessageList: function() {
		this.setState({
			messagesResultSet: MessageStore.getCurrentThreadPaginatedMessages(),
		});
	},	
}

var RecipientsMixin = {
		
	getInitialState: function() {
		return {
			recipients: MessageStore.getRecipients(),
		}
	},
	
	componentDidMount: function() {
		MessageStore.addRecipientsListener(this.onChangeRecipients);
	},
	
	componentWillUnmount: function() {
		MessageStore.removeRecipientsListener(this.onChangeRecipients);
	},
	
	onChangeRecipients: function() {
		this.setState({
			recipients: MessageStore.getRecipients(),
		});
	},	
}

var LastMessageOfAllThreadsMixin = {
	
	getInitialState: function() {
		return {
			lastMessagesResultSet: MessageStore.getLastMessageOfAllThreads(),
		}
	},
	
	componentDidMount: function() {
		MessageStore.addLastMessageOfAllThreadsChangeListener(this.onChangeLastMessageList);
	},
	
	componentWillUnmount: function() {
		MessageStore.removeLastMessageOfAllThreadsChangeListener(this.onChangeLastMessageList);
	},
	
	onChangeLastMessageList: function() {
		this.setState({
			lastMessagesResultSet: MessageStore.getLastMessageOfAllThreads(),
		});
	},		
		
}

var ModuleMixins = {
	
	LoginMixin: LoginMixin, 
	CurrentThreadMixin: CurrentThreadMixin,
	NewThreadFormMixin: NewThreadFormMixin,
	MessagesResultSetMixin: MessagesResultSetMixin,
	RecipientsMixin: RecipientsMixin,
	LastMessageOfAllThreadsMixin: LastMessageOfAllThreadsMixin,
	
}

module.exports = ModuleMixins;