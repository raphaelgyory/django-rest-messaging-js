var React = require('react');
var MessageStore = require('../stores/MessageStore');
var ModuleMixins = require('./ModuleMixins');


function getInitialState() {
	return {
		currentThread: MessageStore.getCurrentThread(),
	};
}


var MessagesLoadMore = React.createClass({
	
	mixins: [
         ModuleMixins.LoginMixin, 
         ModuleMixins.MessagesResultSetMixin,
	],
	
	getDefaultProps: function() {
		return {
			wrappingTag: "button",
			wrappingClass: "messagesMessagesLoadMore btn btn-default btn-sm col-md-12",
			wrappingStyle: {},
			loadText: 'Load more ...',
	    };
	},
	
	getInitialState: function() {
		return getInitialState();
	},
	
	componentDidMount: function() {
		// we listen to the current selected thread
		MessageStore.addThreadInfoChangeListener(this.onChangeThread);
	},

	componentWillUnmount: function() {
		MessageStore.removeThreadInfoChangeListener(this.onChangeThread);
	},
	
	render: function() {
		if(this.state.currentThread && this.state.currentThread.id && this.state.messagesResultSet && this.state.messagesResultSet.next) {
			return (
				<this.props.wrappingTag className={this.props.wrappingClass} style={this.props.wrappingStyle} onClick={this.queryNext}>
					{this.props.loadText}
				</ this.props.wrappingTag>
			);
		} else {
			return <span className="messagesLoadMoreUnactivated"></span>
		}
	},
	
	onChangeThread: function() {
		this.setState({
			currentThread: MessageStore.getCurrentThread(),
			currentThreadPaginatedMessages: MessageStore.getCurrentThreadPaginatedMessages(),
		});
	},
	
	queryNext: function() {
		MessageStore.queryMessagesInThread(this.state.currentThread.id, this.state.messagesResultSet.next);
	},
	
});

module.exports = MessagesLoadMore;