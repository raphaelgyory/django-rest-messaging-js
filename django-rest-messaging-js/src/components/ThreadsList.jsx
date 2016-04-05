var React = require('react');
var MessageStore = require('../stores/MessageStore');
var ThreadsListRowDefaultLayout = require('./ThreadsListRowDefaultLayout');
var ModuleMixins = require('./ModuleMixins');



var ThreadsList = React.createClass({
	
	mixins: [
         ModuleMixins.LoginMixin, 
         ModuleMixins.CurrentThreadMixin,
         ModuleMixins.RecipientsMixin,
         ModuleMixins.LastMessageOfAllThreadsMixin,
	],
	
	getDefaultProps: function() {
		return {
			wrappingTag: "div",
			wrappingClass: "messagesThreadsList",
			wrappingStyle: {},
			layoutForListRows: ThreadsListRowDefaultLayout,
			layoutAdditionnalInfo: {},
			layoutStyle: {},
	    };
	},
	
	render: function() {
		
		if(this.state.loggedInParticipantId != null){
			return (
				<this.props.wrappingTag className={this.props.wrappingClass} style={this.props.wrappingStyle}>
				 	{this.state.lastMessagesResultSet && this.state.lastMessagesResultSet.results.map(function(message, index) {
				 		return (
					 		<this.props.layoutForListRows 
					 			message={message} 
					 			key={index} 
					 			onClickThreadSelected={this.onClickThreadSelected.bind(null, message.thread)} 
					 			layoutAdditionnalInfo={this.props.layoutAdditionnalInfo} 
					 			layoutStyle={this.props.layoutStyle} 
					 			recipients={this.state.recipients}
					 			loggedInParticipantId={this.state.loggedInParticipantId}
					 			currentThread={this.state.currentThread}
					 		/>
				 		);
			        }, this)}
				</ this.props.wrappingTag>
			);
		} else {
			return (
				<this.props.wrappingTag className="messagesThreadsListUnauthenticated">
				</ this.props.wrappingTag>
			);
		}
		
	},
	
	onClickThreadSelected: function(threadId) {
		// callback for the mesages children, to call the sotre and say a thread has been selected
		MessageStore.setCurrentThread(threadId);
	},
	
	notificationsChecked: function() {
		var _this = this;
		MessageStore.
			notificationsChecked();
	},
});

module.exports = ThreadsList;