var React = require('react');
var MessageStore = require('../stores/MessageStore');
var ModuleMixins = require('./ModuleMixins');



var ThreadsLoadMore = React.createClass({
	
	mixins: [
         ModuleMixins.LoginMixin, 
         ModuleMixins.LastMessageOfAllThreadsMixin,
	],
	
	getDefaultProps: function() {
		return {
			wrappingTag: "button",
			wrappingClass: "messagesThreadsLoadMore btn btn-default btn-sm col-md-12",
			wrappingStyle: {},
			loadText: 'Load more ...',
	    };
	},
	
	render: function() {
		if(this.state.loggedInParticipantId && this.state.lastMessagesResultSet && this.state.lastMessagesResultSet.next) {
			return (
				<this.props.wrappingTag className={this.props.wrappingClass} style={this.props.wrappingStyle} onClick={this.queryNext}>
					{this.props.loadText}
				</ this.props.wrappingTag>
			);
		} else {
			return <span className="threadsLoadMoreUnactivated"></span>
		}
	},
	
	queryNext: function() {
		MessageStore.queryLastMessageOfAllThreads(this.state.lastMessagesResultSet.next);
	},
	
});

module.exports = ThreadsLoadMore;