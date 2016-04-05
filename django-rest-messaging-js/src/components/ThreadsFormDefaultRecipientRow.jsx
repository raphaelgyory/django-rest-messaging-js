var React = require('react');

var ThreadsFormDefaultRecipientRow = React.createClass({
	
	render: function() {
		
		return (
			<div onClick={this.props.addRecipient.bind(null, this.props.recipient)} className="selectableRecipient">
				{this.props.recipient.username}
			</div>
		);
		
	},

});

module.exports = ThreadsFormDefaultRecipientRow;