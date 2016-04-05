var React = require('react');
var ThreadsFormSelectedRecipientsSave = require('./ThreadsFormSelectedRecipientsSave');

var ThreadsFormSelectedRecipients = React.createClass({
	
	render: function() {
		return (	
			<div className={this.props.recipientsSelectedClassName} style={this.props.recipientsSelectedStyle}>
				{this.props.recipientsSelected && this.props.recipientsSelected.map(function(recipient, index) {
			 		return (
				 		<this.props.recipientsBadgeLayout 
				 			recipient={recipient} 
				 			key={index} 
				 			removeRecipient={this.props.removeRecipient} 
				 			currentThread={this.props.currentThread} 
				 		/>
			 		);
		        }, this)}
				<ThreadsFormSelectedRecipientsSave 
					recipientsSelected={this.props.recipientsSelected} 
					currentThread={this.props.currentThread}
					saveRecipients={this.props.saveRecipients}
					saveRecipientsClassName={this.props.saveRecipientsClassName}
				/>
			</div>
		);
	},
	
});

module.exports = ThreadsFormSelectedRecipients;