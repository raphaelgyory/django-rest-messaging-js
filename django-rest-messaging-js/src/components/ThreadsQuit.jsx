var React = require('react');
var MessageStore = require('../stores/MessageStore');
var ModuleMixins = require('./ModuleMixins');



var ThreadsQuit = React.createClass({
	
	mixins: [
         ModuleMixins.LoginMixin, 
         ModuleMixins.CurrentThreadMixin,
	],
	
	getDefaultProps: function() {
		return {
			wrappingTag: "a",
			wrappingClass: "messagesThreadsQuit",
			wrappingStyle: {},
			quitText: 'Quit this thread',
	    };
	},
	
	render: function() {
		if(this.state.loggedInParticipantId && this.state.currentThread && this.state.currentThread.id) {
			return (
				<this.props.wrappingTag className={this.props.wrappingClass} style={this.props.wrappingStyle} onClick={this.queryQuit}>
					{this.props.quitText}
				</ this.props.wrappingTag>
			);
		} else {
			return <span className="threadsQuitUnactivated"></span>
		}
	},
	
	queryQuit: function() {
		MessageStore.quitCurrentThread(this.state.currentThread.id);
	},
	
});

module.exports = ThreadsQuit;