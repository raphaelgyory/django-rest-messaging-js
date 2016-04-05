var React = require('react');
var MessageStore = require('../stores/MessageStore');
var ThreadsFormDefaultRecipientSelectedBagde = require('./ThreadsFormDefaultRecipientSelectedBagde');
var ThreadsFormDefaultRecipientRow = require('./ThreadsFormDefaultRecipientRow');
var ThreadsFormSelectableRecipients = require('./ThreadsFormSelectableRecipients');
var ThreadsFormSelectedRecipients = require('./ThreadsFormSelectedRecipients');
var ModuleMixins = require('./ModuleMixins');
var adapters = require('../utils/adapters');
var users = require('../utils/users');
var getUserInfo = users.getUserInfo;


function getInitialState() {
	return {
		currentThread: MessageStore.getCurrentThread(),
		recipients: MessageStore.getRecipients(),
	};
}

var ThreadsForm = React.createClass({
	
	mixins: [
         ModuleMixins.LoginMixin, 
	],
	
	getDefaultProps: function() {
		return {
			wrappingTag: "div",
			wrappingClass: "messagesThreadsForm",
			wrappingStyle: {},
			recipientsIterator: "username", // by default, we show the username of the user
			recipientsRowLayout: ThreadsFormDefaultRecipientRow, // the default layout for each potential recipient
			recipientsAdditionalInfo: {},
			recipientsRowStyle: {},
			recipientsBadgeLayout: ThreadsFormDefaultRecipientSelectedBagde, // the default layout for each selected recipient
			recipientsSelectableClassName: "recipientsSelectable",
			recipientsSelectedClassName: "recipientsSelected",
			recipientsSelectedStyle: {},
			recipientsSelectedBagde: ThreadsFormDefaultRecipientSelectedBagde,
			recipientsPlaceholder: "Filter ...",
			recipientsFilterClass: "recipientsFilterClass form-control",
			recipientsEmptyAlertMessage: "Please select recipients",
			recipientsSelectMessage: "Select recipients:",
			saveRecipientsClassName: "btn btn-primary btn-sm saveNewRecipient",
			titleHeader: "Conversation with",
			recipientsAddToThreadIcon: "glyphicon glyphicon-user addUser",
			recipientsRemoveFromThreadIcon: "glyphicon glyphicon-remove removeUser",
			recipientAddToThreadLinkClass: "recipientAddToThreadLink pull-right",
			participantAdapter: adapters.defaultParticipantAdapter,
	    };
	},

	getInitialState: function() {
		// we get the initial state
		var state = getInitialState();
		// to be able to chain thread and messages creation --> no empty thread
		if(state.currentThread && // we update threads
				state.currentThread.id == 0){ // a new thread
			this.registerInStore();
		}
		return state;
	},
	
	componentWillUpdate: function(nextProps, nextState) {
		// we register in store when we have a new thread
		// or when, already having a new thread, we have new participants
		if(nextState.currentThread && nextState.currentThread.id == 0){ 
			if(nextState.currentThread.id != this.state.currentThread.id ||
					nextState.recipientsSelected.length >= 0
			){
				this.registerInStore();
			}
		}
	},
	
	componentWillMount: function() {
		this.chekSelectableSelected();
	},
	
	componentDidMount: function() {
		// we listen to the current selected thread
		MessageStore.addThreadInfoChangeListener(this.onChangeThread);
		// we listen to changes in the recipients
		MessageStore.addRecipientsListener(this.onChangeRecipients);
	},

	// Remove change listers from stores
	componentWillUnmount: function() {
		MessageStore.removeThreadInfoChangeListener(this.onChangeThread);
		MessageStore.removeRecipientsListener(this.onChangeRecipients);
	},
	
	render: function() {
		var _this = this;
		// by default,
		// if the thread has not yet started, users can be added and removed
		// if the thread has already started, they can only be added
		
		if(this.state.loggedInParticipantId != null){
			
			if(this.state.currentThread.id == 0 || this.state.showForm == true){
				return (
						
					<this.props.wrappingTag className={this.props.wrappingClass} style={this.props.wrappingStyle}>
						<div className="threadFormTitleHeader">
						
							{this.props.recipientsSelectMessage}
							
							<a onClick={this.showForm.bind(null, false)} className={this.props.recipientAddToThreadLinkClass}>
								<i className={this.props.recipientsRemoveFromThreadIcon}></i>
							</a>
							
						</div>
						
					
						<ThreadsFormSelectedRecipients 
							recipientsSelectedClassName={this.props.recipientsSelectedClassName} 
							recipientsSelectedStyle={this.props.recipientsSelectedStyle}
							recipientsBadgeLayout={this.props.recipientsBadgeLayout}
							recipientsSelected={this.state.recipientsSelected}
							removeRecipient={this.removeRecipient} 
							currentThread={this.state.currentThread}
							saveRecipients={this.saveRecipients}
							saveRecipientsClassName={this.props.saveRecipientsClassName}
						/>
						
						
						<ThreadsFormSelectableRecipients
							recipientsSelectableClassName={this.props.recipientsSelectableClassName} 
							recipientsSelectableStyle={this.props.recipientsSelectableStyle}
							recipientsFilterClass={this.props.recipientsFilterClass} 
							filterRecipients={this.filterRecipients} 
							recipientsPlaceholder={this.props.recipientsPlaceholder} 
							recipientsSelectable ={this.state.recipientsSelectable}
							recipientsRowLayout={this.props.recipientsRowLayout}
						 	addRecipient={this.addRecipient} 
							recipientsAdditionalInfo={this.props.recipientsAdditionalInfo} 
							recipientsRowStyle={this.props.recipientsRowStyle}
							currentThread={this.state.currentThread}
						/>
						
				 	</ this.props.wrappingTag>
				);
			} else if(this.state.recipientsSelected && this.state.recipientsSelected.length > 1) {
				return <div className="threadFormTitleHeader page-header">
					{this.props.titleHeader} 
					&nbsp;
					{this.state.recipientsSelected.map(function(r){
						var userInfo = getUserInfo(_this.state.recipientsSelected, r.id, _this.props.participantAdapter)
						return userInfo.username
					}).join(", ")}.
					&nbsp;
					<a onClick={this.showForm.bind(null, true)} className={this.props.recipientAddToThreadLinkClass}>
						<i className={this.props.recipientsAddToThreadIcon}></i>
					</a>
				</div>
			} else {
				return <span></span>
			}
			
			
		} else {
			return (
				<this.props.wrappingTag className="messagesThreadsFormUnauthenticated">
				</ this.props.wrappingTag>
			);
		}
		
	},
	
	onChangeThread: function() {
		var currentThread = MessageStore.getCurrentThread();
		this.setState({
			currentThread: currentThread,
		});
		this.chekSelectableSelected(currentThread);
	},
	
	onChangeRecipients: function() {
		this.setState({
			recipients: MessageStore.getRecipients(),
		});
		this.chekSelectableSelected(this.state.currentThread);
	},
	
	chekSelectableSelected: function(currentThread) {
		// we check which participants are already selected in the thread and which are selectable
		var stateRecipientsSelected =  [];
		var stateRecipientsSelectable = [];
		var _this = this;
		
		this.state.recipients.map(function(recipient, index) {
			if(currentThread && currentThread.participants.indexOf(recipient.id) !== -1){
				// he is already in the conversation
				stateRecipientsSelected.push(recipient);
	    	} else if (_this.state.loggedInParticipantId != recipient.id){
	    		// he is not yet in the conversation
	    		// we have ensured we make not the current user selectable
	    		stateRecipientsSelectable.push(recipient);
	    	}
        })
		
		// by default, all the participants passsed as props are selectable
		this.setState({
			recipientsSelected: stateRecipientsSelected,
			recipientsSelectable: stateRecipientsSelectable,
    	});
	},
	
	addRecipient: function(recipient) {
		
	    if (this.state.recipientsSelected) {
	    	var recipients = this.state.recipientsSelected;
	    	if(recipients.indexOf(recipient) === -1){
	    		recipients.push(recipient);
	    		this.setState({
		    		recipientsSelected: recipients,
		    	});
	    	}
	    } else {
	    	this.setState({
	    		recipientsSelected: [recipient],
	    	});
	    }
	},
	
	removeRecipient: function(recipient) {
	    if (this.state.recipientsSelected) {
	    	
	    	var recipients = []; // cannot splice on state and indexof not working on clone without assignment
	    	
	    	for (var i = 0; i < this.state.recipientsSelected.length; i++) {
	    	    if(recipient.id != this.state.recipientsSelected[i].id){
	    	    	recipients.push(this.state.recipientsSelected[i]);
	    	    }
	    	}
	    	
	    	if (this.state.recipientsSelected.length != recipients.length) { // we ensure the recipient was indeed removable before updating the state
	    		 this.setState({
	    			 recipientsSelected: recipients,
	 	    	});
	    	}
	    	
	    }
	},
	
	filterRecipients: function(e) {
		// we get the filter text
		
		var filterText = e.target.value;
		var _this = this;
		
	    // if the filter is empty, we show all the recipients
		if (!filterText || filterText.trim().length < 1) {
			
			this.setState({
				recipientsSelectable: this.state.recipients.map(function(recipient, index){
					if(_this.state.loggedInParticipantId != recipients.id) {
						return recipient;
					}
				}),
			});
		
		// if not, we filter
		} else {
			
			var macthingRecipients = [];

			for (var i = 0; i < this.state.recipients.length; i++) {
				if (this.state.recipients[i][this.props.recipientsIterator].search(new RegExp(filterText, "i")) !== -1 &&
						this.state.loggedInParticipantId != this.state.recipients[i].id) {
					macthingRecipients.push(this.state.recipients[i]);
			    }
			}
			
			this.setState({
				recipientsSelectable: macthingRecipients,
			});
		}
	},
	
	saveRecipients: function() {
		// we have potentially new participants
		// this can be used with existing threads only!!
		if (this.state && this.state.currentThread &&  this.state.currentThread.id != 0) {
			var recipientIdsToPost = [];
			for (var i = 0; i < this.state.recipientsSelected.length; i++) {
				if (this.state.currentThread.participants.indexOf(this.state.recipientsSelected[i].id) === -1) {
					recipientIdsToPost.push(this.state.recipientsSelected[i].id);
			    }
			}
			MessageStore.addThreadParticipants(this.state.currentThread.id, recipientIdsToPost);
		}
	},
	
	saveThreadWithRecipients: function() {
		// we do not want to submit an empty thread
		// this serves as callback to the MessageForm to submit
		// the thread with its first message
		var recipientsIds = this.state.recipientsSelected.map(function(recipient, index) {
	 		return recipient.id;
	    });
		
		return MessageStore.createThread(null, recipientsIds);
	},
	
	registerInStore: function(){
		// we save the thread form instance in the store to be able to chain it with the messages form
		MessageStore.setThreadForm(this);
	},
	
	showForm: function(bool){
		// we save the thread form instance in the store to be able to chain it with the messages form
		this.setState({
			showForm: bool,
		});
	}
	
});

module.exports = ThreadsForm;