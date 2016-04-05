var React = require('react');
var MessageStore = require('../stores/MessageStore');
var MessagesFormDefaultInput = require('./MessagesFormDefaultInput');
var ModuleMixins = require('./ModuleMixins');

var MessagesForm = React.createClass({
	
	mixins: [
         ModuleMixins.LoginMixin, 
         ModuleMixins.CurrentThreadMixin,
         ModuleMixins.NewThreadFormMixin
	],
	
	getDefaultProps: function() {
		return {
			disableWhenNoThread: true, // by default, the form will be disabled when no thread is selected
			preSubmitCallback: null, // this allows us to do something before submitting the form 
			wrappingTag: "div",
			wrappingClass: "messagesMessagesForm",
			wrappingStyle: {},
			formInput: MessagesFormDefaultInput,
			formInputClass: "form-control messageFormInput",
			formSubmitClass: "btn btn-primary col-md-12 messageFormSubmit",
			formSubmitIClass: "glyphicon glyphicon-pencil",
			formSubmitText: "",
	    };
	},
	
	componentWillMount: function() {
		this.setState({text:""});
	},
	
	render: function() {
		// we check if we must disable the form
		if(this.state.currentThread && 
				this.state.currentThread.id == 0 && 
				this.props.disableWhenNoThread == true &&
				this.state.newthreadForm && 
				this.state.newthreadForm.state.recipientsSelected && 
				this.state.newthreadForm.state.recipientsSelected.length < 1) {
			var disabled = true;
		} else {
			var disabled = false;
		}

		// we check if the user is authenticated
		if(this.state.loggedInParticipantId != null && this.state.currentThread.id != null){
			
			return (
				<this.props.wrappingTag className={this.props.wrappingClass} style={this.props.wrappingStyle}>
					<this.props.formInput formInputClass={this.props.formInputClass} formSubmitClass={this.props.formSubmitClass} formSubmitIClass={this.props.formSubmitIClass} text={this.state.text} handleTextChange={this.handleTextChange} handleSubmit={this.handleSubmit} disabled={disabled} />
				</ this.props.wrappingTag>
			);
			
		} else {
			
			return (
				<div className="messagesMessagesFormUnactivated">
				</div>
			);
			
		}
	},
	
	handleTextChange: function(e) {
	    this.setState({text: e.target.value});
	},
	
	getText: function() {
		if(this.state.text) {
			var text = this.state.text.trim();
		} else {
			var text = "";
		}
		return text;
	},
	
	handleSubmit: function(e) {

		e.preventDefault();
		
		var text = this.getText();
		
		// we send the request to the server
		var _this = this;
		
		// we first ensure we actually have a message
		if(text.length < 1){
			return;
		}

		if (this.state.currentThread && this.state.currentThread.id > 0) { // we use 0 as temporary thread
			// if we have no callback, we require a current thread
			MessageStore.
				postMessage(this.state.currentThread.id, text).
				done(function(json){
					_this.setState({text: ''});
				});
				
		} else if (this.state.currentThread && this.state.currentThread.id == 0){
			// we use a callback telling the store that a message for a new thread is ready to be saved
			MessageStore.
				submitThreadForm().
				done(function(thread){
					MessageStore.
						postMessage(thread.id, text).
						done(function(json){
							// empty the text
							_this.setState({text: ''});
							// refresh the list of last messages in thread
							MessageStore.queryLastMessageOfAllThreads(null);
						});
				});
		}
	},
	
});

module.exports = MessagesForm;