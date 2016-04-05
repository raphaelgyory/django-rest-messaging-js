var React = require('react');

var ThreadsFormSelectedRecipientsSave = React.createClass({
	
	render: function() {
		// we check if new participants have been added
		if(this.props.currentThread.id && 
				this.props.currentThread.id != 0 && 
				this.props.recipientsSelected.length > this.props.currentThread.participants.length) {
			return (
				<button onClick={this.props.saveRecipients} className={this.props.saveRecipientsClassName}>Save</button>
			);
		} else {
			return <span></span>
		}
	},
	
});

module.exports = ThreadsFormSelectedRecipientsSave;