
jest.dontMock('object-assign');
jest.dontMock('../MessagesForm');
jest.dontMock('../ThreadsForm');
jest.dontMock('../ModuleMixins');
jest.dontMock('jquery');

describe('MessagesForm', function() {
	
	var React;
	var ReactDOM;
	var TestUtils;
	var MessagesForm;
	var MessagesFormDefaultInput;
	var ThreadsForm;
	var MessageStore;
	var $ = require('jquery');
	
	var thread = {
		id: 1,
		name: 'Thread 1',
		participants: [1, 2],
	}
	
	beforeEach(function() {
		React = require('react');
		ReactDOM = require('react-dom');
		TestUtils = require('react-addons-test-utils');
		MessagesForm = require('../MessagesForm');
		MessagesFormDefaultInput = require('../MessagesFormDefaultInput');
		ThreadsForm = require('../ThreadsForm');
		MessageStore = require('../../stores/MessageStore');
		MessageStore.getLoggedInParticipantId.mockReturnValue(1); // we say the user is logged in
		MessageStore.getCurrentThread.mockReturnValue(thread); // we say the selected thread is this one
		MessageStore.postMessage.mockReturnValue({}); // we do not care about the value actually returned
	});
	
	it('defaults props', function(){
		// we instantiate
		var renderedMessagesForm = TestUtils.renderIntoDocument( <MessagesForm/> );
		var messagesFormNode = ReactDOM.findDOMNode(renderedMessagesForm);
		expect(renderedMessagesForm.props.currentThreadId).toEqual(null);
		expect(renderedMessagesForm.props.disableWhenNoThread).toEqual(true);
		
		// by default, the content is rendered in a div with class "wrappingClass"
		expect(renderedMessagesForm.props.wrappingTag).toEqual('div');
		expect(messagesFormNode.tagName).toEqual("DIV");
		expect(renderedMessagesForm.props.wrappingClass).toEqual('messagesMessagesForm');
		expect(messagesFormNode.classList[0]).toEqual('messagesMessagesForm');
		expect(renderedMessagesForm.props.wrappingStyle).toEqual({});
		
		expect(renderedMessagesForm.props.formInput).toEqual(MessagesFormDefaultInput);
		
	});
	
	it('props passed to child', function(){
		// we create a custom form field
		var MessagesFormCustomInput = React.createClass({
			
			render: function() {
				//this.props.handleTextChange();
				return (
					<textarea value={this.props.text} onChange={this.props.handleTextChange} disabled={this.props.disabled} >
						
					</textarea>
				);
			},
			
		});
		
		// the components must pass props to its child to allow customization
		var formInputProps = {foo: 'bar'};
		var renderedMessagesForm = TestUtils.renderIntoDocument( 
			<MessagesForm formInput={MessagesFormCustomInput} formInputRef={'messagesMessagesFormCustomRef'} formInputProps={formInputProps} />
		);
		var input = TestUtils.scryRenderedComponentsWithType(renderedMessagesForm, MessagesFormCustomInput)[0];
		// we check the parent's callback is passed
		expect(input.props.handleTextChange).not.toEqual(undefined);
		
		// we make a change in the child, this must reflect in the parent
		// for now renderedMessagesForm.state.text should be an empty string
		expect(renderedMessagesForm.state.text).toEqual('');
		TestUtils.Simulate.change( ReactDOM.findDOMNode(input), { target: { value: 'new text'}});
		expect(renderedMessagesForm.state.text).toEqual('new text');
	});
	
	it('handleSubmit ok', function(){
		// we start with a logged in user
		var renderedMessagesForm = TestUtils.renderIntoDocument( <MessagesForm currentThread={thread}/> );
		var input = TestUtils.scryRenderedComponentsWithType(renderedMessagesForm, MessagesFormDefaultInput)[0];
		var inputSubmit = TestUtils.scryRenderedDOMComponentsWithTag(renderedMessagesForm, 'button')[0];
		
		// by default, the renderedMessagesForm's this.state.text will be blank
		expect(renderedMessagesForm.state.text).toEqual('');
		
		var deferred = new $.Deferred();
		var mockedJsonResp = {
	    		foo: "bar"
	    };
	    var mockedDefered = deferred.resolve(mockedJsonResp);
		
		// we spy the store
		spyOn(MessageStore, "postMessage").andReturn(deferred);
		
		// ok
		renderedMessagesForm.setState({currentThread: thread, text: "abcd"});
		TestUtils.Simulate.click(inputSubmit);
		expect(MessageStore.postMessage).toHaveBeenCalledWith(1, "abcd");
		
		// the state has been reset
		expect(renderedMessagesForm.state.text).toEqual("");
		
	});
	
	it('handleSubmit no message', function(){
		// we render
		var renderedMessagesForm = TestUtils.renderIntoDocument( <MessagesForm currentThread={thread}/> );
		var input = TestUtils.scryRenderedComponentsWithType(renderedMessagesForm, MessagesFormDefaultInput)[0];
		var inputSubmit = TestUtils.scryRenderedDOMComponentsWithTag(renderedMessagesForm, 'button')[0];
		
		// by default, the renderedMessagesForm's this.state.text will be blank
		expect(renderedMessagesForm.state.text).toEqual('');
		
		// we spy the store
		spyOn(MessageStore, "postMessage")
		
		// submitting the form will not work if the text is undefined or is an empty string
		renderedMessagesForm.setState({text: ""});
		TestUtils.Simulate.click(inputSubmit);
		expect(MessageStore.postMessage).not.toHaveBeenCalled();
		
	});

	it('handleSubmit create thread preSubmitCallback', function(){
		// we mock a post with a defered response
		var deferred = new $.Deferred();
		var mockedJsonResp = {
			id: "foo", // should be overriden because we listen to the store
			name: null,
			participants: [1, 2],
		};
	    var mockedDefered = deferred.resolve(mockedJsonResp);
		
	    // we use this function because spyOn($, 'ajax') works but spyOn(this, 'dummyCall') or spyOn(renderedMessagesForm.props, 'preSubmitCallback') do not
	    function dummyCall(){ 
	    	return $.ajax({
	            url: 'url',
	            type: 'type',
	            dataType: "json",
	            contentType: "application/json",
	            data: JSON.stringify({}),
	        });
	    }
	    
		// we render
		var renderedMessagesForm = TestUtils.renderIntoDocument( <MessagesForm preSubmitCallback={dummyCall}/> );
		renderedMessagesForm.setState({text: "abcd"}); // submitting the form will not work if the current thread is not set
		var inputSubmit = TestUtils.scryRenderedDOMComponentsWithTag(renderedMessagesForm, 'button')[0];
		
		// we spy
		spyOn(MessageStore, "postMessage").andReturn(deferred);
		spyOn($, 'ajax').andReturn(deferred);
		
		TestUtils.Simulate.click(inputSubmit);
		expect(MessageStore.postMessage).toHaveBeenCalledWith(MessageStore.getCurrentThread().id, "abcd");
		
	});
	
	it('login state', function(){
		// we start with a logged in user
		var renderedMessagesForm = TestUtils.renderIntoDocument( <MessagesForm/> );
		var messagesFormNode = ReactDOM.findDOMNode(renderedMessagesForm);
		// we ensure the component listens to the login status of the user on logout
		renderedMessagesForm.setState({loggedInParticipantId: null});
		renderedMessagesForm.setState({currentThreadId: 1}); // this is ok
		expect(messagesFormNode.classList[0]).toEqual('messagesMessagesFormUnactivated');
	});
	
	it('handleSubmit new thread', function(){
		
		// we spy the store
		var deferred = new $.Deferred();
		var mockedJsonResp = {
			id: 38,
			name: null,
			participants: [1, 2],
		}
	    var mockedDefered = deferred.resolve(mockedJsonResp);
		spyOn(MessageStore, "postMessage").andReturn(deferred);
		spyOn(MessageStore, "submitThreadForm").andReturn(deferred);
		
		MessageStore.getCurrentThread.mockReturnValue(thread = {
				id: 0,
				name: null,
				participants: [],
			});
		// we render
		var renderedMessagesForm = TestUtils.renderIntoDocument( <MessagesForm /> );
		var inputSubmit = TestUtils.scryRenderedDOMComponentsWithTag(renderedMessagesForm, 'button')[0];
		
		// by default, the renderedMessagesForm's this.state.text will be blank
		expect(renderedMessagesForm.state.text).toEqual('');
		
		// submitting the form will not work if the current thread is not set
		renderedMessagesForm.setState({text: "abcd"});
		TestUtils.Simulate.click(inputSubmit);
		expect(MessageStore.postMessage).toHaveBeenCalledWith(mockedJsonResp.id, "abcd");

	});
	
	it('input disabled', function(){
		// the input is diesabled if we ask so and have no thread
		MessageStore.getCurrentThread.mockReturnValue(thread = {
			id: 0,
			name: null,
			participants: [],
		});
		var renderedMessagesForm = TestUtils.renderIntoDocument( 
			<MessagesForm />
		);
		renderedMessagesForm.setState({
			currentThread: {
				id: 0,
				name: null,
				participants: [],
			},
			newthreadForm : {
				state: {
					recipientsSelected:[] // we simulate a form registered with the store
				}
			}
		}); 
		var input = TestUtils.scryRenderedComponentsWithType(renderedMessagesForm, MessagesFormDefaultInput)[0];
		expect(input.props.disabled).toEqual(true);
	});
});