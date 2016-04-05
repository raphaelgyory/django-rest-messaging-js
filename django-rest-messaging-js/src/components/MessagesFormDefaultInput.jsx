var React = require('react');

var MessagesFormDefaultInput = React.createClass({
	
	getDefaultProps: function() {
		return {
			formSubmitClass: "btn btn-primary messageFormSubmit",
			formSubmitIClass: "glyphicon glyphicon-pencil",
			formSubmitText: "",
			formInputClass: "form-control messageFormInput",
			disabled: false,
	    };
	},
	
	render: function() {
		return (
			<div className="row">
				<div className="col-md-10">
					<input type="text" className={this.props.formInputClass} defaultValue={this.props.text} value={this.props.text} onChange={this.props.handleTextChange} />
				</div>
				<div className="col-md-2">
					<button onClick={this.props.handleSubmit} className={this.props.formSubmitClass} disabled={this.props.disabled}>
						<i className={this.props.formSubmitIClass}></i> 
					</button>
				</div>
			</div>
		);
	},
	
});

module.exports = MessagesFormDefaultInput;