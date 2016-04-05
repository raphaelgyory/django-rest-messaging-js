var React = require('react');

var ThreadsFormSelectableRecipients = React.createClass({
	
	render: function() {

		if (this.props.currentThread && this.props.currentThread.id != null && this.props.currentThread.id >= 0) {
			return (	
				<div className={this.props.recipientsSelectableClassName} style={this.props.recipientsSelectableStyle}>
					<input type="text" className={this.props.recipientsFilterClass} onChange={this.props.filterRecipients} placeholder={this.props.recipientsPlaceholder} />
					{this.props.recipientsSelectable && this.props.recipientsSelectable.map(function(recipient, index) {
				 		return (
					 		<this.props.recipientsRowLayout 
					 			recipient={recipient} 
					 			key={index} 
					 			addRecipient={this.props.addRecipient} 
					 			recipientsAdditionalInfo={this.props.recipientsAdditionalInfo}
					 			recipientsRowStyle={this.props.recipientsRowStyle}
					 		/>
				 		);
			        }, this)}
				</div>
			);
		} else {
			return <span></span>
		}	
	},
});


module.exports = ThreadsFormSelectableRecipients;