var React = require('react');
var MessageStore = require('../stores/MessageStore');
var MessagesListRowDefaultLayout = require('./MessagesListRowDefaultLayout');
var ModuleMixins = require('./ModuleMixins');
var adapters = require('../utils/adapters');


var MessagesList = React.createClass({
	
	mixins: [
         ModuleMixins.LoginMixin, 
         ModuleMixins.MessagesResultSetMixin,
         ModuleMixins.RecipientsMixin,
	],
	
	getDefaultProps: function() {
		return {
			wrappingTag: "div",
			wrappingClass: "messagesMessagesList",
			wrappingStyle: {},
			layoutForListRows: MessagesListRowDefaultLayout,
			layoutAdditionnalInfo: {},
			layoutStyle: {},
			participantAdapter: adapters.defaultParticipantAdapter,
	    };
	},
	
	render: function() {
		
		if(this.state.loggedInParticipantId != null){
			return (
				<this.props.wrappingTag className={this.props.wrappingClass} style={this.props.wrappingStyle}>
				 	{this.state.messagesResultSet && this.state.messagesResultSet.results.map(function(message, index) {
				 		return (
					 		<this.props.layoutForListRows 
					 			sentByCurrentParticipant={message.sender == this.state.loggedInParticipantId} 
					 			recipients={this.state.recipients} 
					 			message={message} 
					 			key={index} 
					 			layoutAdditionnalInfo={this.props.layoutAdditionnalInfo} 
					 			layoutStyle={this.props.layoutStyle}
					 		/>
				 		);
			        }, this)}
				</ this.props.wrappingTag>
			);
		} else {
			return (
				<this.props.wrappingTag className="messagesMessagesListUnauthenticated">
				</ this.props.wrappingTag>
			);
		}
		
	},
});

module.exports = MessagesList;