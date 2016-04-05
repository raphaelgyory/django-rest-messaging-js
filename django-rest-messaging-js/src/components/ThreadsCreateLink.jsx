var React = require('react');
var MessageStore = require('../stores/MessageStore');
var ModuleMixins = require('./ModuleMixins');


var ThreadsCreateLink = React.createClass({
	
	mixins: [
         ModuleMixins.LoginMixin, 
	],
	
	render: function() {
		
		if(this.state.loggedInParticipantId != null){
			return (<a href="#" className="threadsCreate" onClick={this.initializeNewThread}>Create a new thread</a>);
		} else {
			return <span className="threadsCreateUnactivated"></span>
		}		
	},
	
	initializeNewThread: function() {
		MessageStore.initializeNewThread();
	},
	
});

module.exports = ThreadsCreateLink;