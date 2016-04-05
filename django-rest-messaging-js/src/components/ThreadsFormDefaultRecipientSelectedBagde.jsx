var React = require('react');


var ThreadsFormDefaultRecipientSelectedBagde = React.createClass({
	
	render: function() {
		
		
		
		
		
		if(this.props.currentThread && this.props.currentThread.participants && this.props.currentThread.participants.indexOf(this.props.recipient.id) !== -1){
			return (
				<span className="recipientBadge">
					{this.props.recipient.username}
				</span>
			);
		} else {
			return (
				<span className="recipientBadge">
					{this.props.recipient.username}
					&nbsp;
					<i onClick={this.props.removeRecipient.bind(null, this.props.recipient)} className="removeRecipientBadge">x</i>
				</span>
			);
		}
	},

});

module.exports = ThreadsFormDefaultRecipientSelectedBagde;