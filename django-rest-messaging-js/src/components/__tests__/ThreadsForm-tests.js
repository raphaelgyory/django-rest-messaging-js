
jest.dontMock('object-assign');
jest.dontMock('../ThreadsForm');
jest.dontMock('../ThreadsFormSelectableRecipients');
jest.dontMock('../ThreadsFormSelectedRecipients');
jest.dontMock('../ThreadsFormSelectedRecipientsSave');
jest.dontMock('../ThreadsFormDefaultRecipientSelectedBagde');
jest.dontMock('../../constants/MessageConstants');
jest.dontMock('../MessagesForm');
jest.dontMock('jquery')
jest.dontMock('keymirror');
jest.dontMock('../../utils/users');


describe('ThreadsForm', function() {
	
	var React;
	var ReactDOM;
	var TestUtils;
	var ThreadsForm;
	var ThreadsFormDefaultRecipientRow;
	var ThreadsFormDefaultRecipientSelectedBagde;
	var ThreadsFormSelectableRecipients;
	var ThreadsFormSelectedRecipients;
	var ThreadsFormSelectedRecipientsSave;
	var MessageStore;
	var MessagesForm;
	var MessagesFormDefaultInput;
	var $ = require('jquery');
	var AppDispatcher;
	var callback;
	var MessageConstants = require('../../constants/MessageConstants');
	
	var users = [
	     {
	    	 "id": 1,
	    	 "username": "user1",
	    	 "picture": "/path/to/picture1.png"
	     },
	     {
	    	 "id": 2,
	    	 "username": "user2",
	    	 "picture": "/path/to/picture2.png"
	     },
	     {
	    	 "id": 3,
	    	 "username": "user3",
	    	 "picture": "/path/to/picture3.png"
	     },
	];
	
	beforeEach(function() {
		React = require('react');
		ReactDOM = require('react-dom');
		TestUtils = require('react-addons-test-utils');
		ThreadsForm = require('../ThreadsForm');
		ThreadsFormDefaultRecipientRow = require('../ThreadsFormDefaultRecipientRow');
		ThreadsFormDefaultRecipientSelectedBagde = require('../ThreadsFormDefaultRecipientSelectedBagde');
		ThreadsFormSelectableRecipients = require('../ThreadsFormSelectableRecipients');
		ThreadsFormSelectedRecipients = require('../ThreadsFormSelectedRecipients');
		ThreadsFormSelectedRecipientsSave = require('../ThreadsFormSelectedRecipientsSave');
		MessageStore = require('../../stores/MessageStore');
		MessagesForm = require('../MessagesForm');
		MessagesFormDefaultInput = require('../MessagesFormDefaultInput');
		MessageStore.getLoggedInParticipantId.mockReturnValue(1); // we say the user is logged in
		MessageStore.getCurrentThread.mockReturnValue({
			id: null,
			name: null,
			participants: [],
		});
		MessageStore.postMessage.mockReturnValue({}); // we do not care about the value actually returned
		MessageStore.getRecipients.mockReturnValue(users); // users to choose from
	});
	
	it('defaults props', function(){
		// we instantiate
		var renderedThreadsForm = TestUtils.renderIntoDocument( <ThreadsForm/> );
		var threadsFormNode = ReactDOM.findDOMNode(renderedThreadsForm);

		// by default, the content is rendered in a div with class "wrappingClass"
		expect(renderedThreadsForm.props.wrappingTag).toEqual('div');
		expect(renderedThreadsForm.props.wrappingClass).toEqual('messagesThreadsForm');
		expect(renderedThreadsForm.props.wrappingStyle).toEqual({});
		
		expect(renderedThreadsForm.props.recipientsIterator).toEqual("username");
		expect(renderedThreadsForm.props.recipientsRowLayout).toEqual(ThreadsFormDefaultRecipientRow);
		expect(renderedThreadsForm.props.recipientsAdditionalInfo).toEqual({});
		expect(renderedThreadsForm.props.recipientsRowStyle).toEqual({});
		expect(renderedThreadsForm.props.recipientsSelectedClassName).toEqual('recipientsSelected');
		expect(renderedThreadsForm.props.recipientsSelectedStyle).toEqual({});
		expect(renderedThreadsForm.props.recipientsSelectedBagde).toEqual(ThreadsFormDefaultRecipientSelectedBagde);
		expect(renderedThreadsForm.props.recipientsPlaceholder).toEqual("Filter ...");
		expect(renderedThreadsForm.props.recipientsFilterClass).toEqual("recipientsFilterClass form-control");
	});
	
	it('login state', function(){
		// we say we createa new thread (does not require us to select participants for testing)
		MessageStore.getCurrentThread.mockReturnValue({
			id:0,
			name:"null",
			participants:[]
		});
		// we start with a logged in user
		var renderedThreadsForm = TestUtils.renderIntoDocument( <ThreadsForm/> );
		var threadsFormNode = ReactDOM.findDOMNode(renderedThreadsForm);
		expect(threadsFormNode.classList[0]).toEqual('messagesThreadsForm');
		// we ensure the component listens to the login status of the user on logout
		renderedThreadsForm.setState({loggedInParticipantId: null});
		expect(threadsFormNode.classList[0]).toEqual('messagesThreadsFormUnauthenticated');
		// we ensure the component listens to the login status of the user on login
		renderedThreadsForm.setState({loggedInParticipantId: 1});
		expect(threadsFormNode.classList[0]).toEqual('messagesThreadsForm');
	});
	
	it('users badges list, remove recipient (TODO: split tests)', function(){
		MessageStore.getCurrentThread.mockReturnValue({
			id: 1,
			name: null,
			participants: [users[0].id],
		});
		// we ensure the user list is correctly rendered
		var renderedThreadsForm = TestUtils.renderIntoDocument( <ThreadsForm   /> );
		renderedThreadsForm.setState({recipientsSelected: users});
		// we see the names of the participants
		var threadsFormNode = ReactDOM.findDOMNode(renderedThreadsForm);
		expect(threadsFormNode.classList[0]).toEqual('threadFormTitleHeader');
		// we ask to update it
		renderedThreadsForm.setState({recipientsSelected: users, showForm: true});
		// we get the children
		var children = TestUtils.scryRenderedComponentsWithType(renderedThreadsForm, ThreadsFormDefaultRecipientSelectedBagde);
		expect(children[0].props.recipient).toEqual(users[0]);
		expect(children[1].props.recipient).toEqual(users[1]);
		expect(children[2].props.recipient).toEqual(users[2]);
		// for now, all the users are in
		expect(renderedThreadsForm.state.recipientsSelected).toEqual([users[0], users[1], users[2]]);
		// we can remove a user
		expect(children[0].props.removeRecipient).toEqual(renderedThreadsForm.removeRecipient);
		var removeBtn = TestUtils.scryRenderedDOMComponentsWithClass(renderedThreadsForm, 'removeRecipientBadge')[0];
		TestUtils.Simulate.click(ReactDOM.findDOMNode(removeBtn));
		expect(renderedThreadsForm.state.recipientsSelected.length).toEqual(2);
	});
		
	it('users default badges list will not allow to remove recipient if he is in the thread store', function(){
		MessageStore.getCurrentThread.mockReturnValue({
			id: 1,
			name: null,
			participants: [users[0].id],
		});
		var renderedThreadsForm = TestUtils.renderIntoDocument( <ThreadsForm   /> );
		renderedThreadsForm.setState({
			recipientsSelected: users,
			showForm: true,
		});
		// we get the children
		var children = TestUtils.scryRenderedComponentsWithType(renderedThreadsForm, ThreadsFormDefaultRecipientSelectedBagde);
		// for now, all the users are in
		expect(renderedThreadsForm.state.recipientsSelected).toEqual([users[0], users[1], users[2]]);
		// we can NOT remove user 0
		var removeBtn0 = TestUtils.scryRenderedDOMComponentsWithTag(children[0], 'i');
		expect(removeBtn0.length).toEqual(0);
		// user 1 can be removed as usual
		var removeBtn1 = TestUtils.scryRenderedDOMComponentsWithTag(children[1], 'i');
		expect(removeBtn1.length).toEqual(1);
	});
	
	it('componentWillUpdate, registerInStore', function(){
		// we ensure the user list is correctly rendered
		var renderedThreadsForm = TestUtils.renderIntoDocument( <ThreadsForm   /> );
		expect(renderedThreadsForm.state.currentThread.id).toEqual(null);
		// people in recipientsSelected but not in participants will be added
		var newThread = {
			id: 0,
			name: null,
			participants: [],
		};
		
		// we spy
		spyOn(renderedThreadsForm, "registerInStore");
		
		// we update the state
		renderedThreadsForm.componentWillUpdate({}, {currentThread: newThread});
		expect(renderedThreadsForm.registerInStore).toHaveBeenCalled();
		
	});
	
	it('registerInStore, setThreadForm', function(){
		// we ensure the user list is correctly rendered
		var renderedThreadsForm = TestUtils.renderIntoDocument( <ThreadsForm   /> );
		
		// we spy
		spyOn(MessageStore, "setThreadForm");
		
		// we call
		renderedThreadsForm.registerInStore();
		
		expect(MessageStore.setThreadForm).toHaveBeenCalledWith(renderedThreadsForm);
		
	});
	
	
	it('chekSelectableSelected', function(){
		// we ensure the user list is correctly rendered
		var renderedThreadsForm = TestUtils.renderIntoDocument( <ThreadsForm /> );
		renderedThreadsForm.setState({
			recipients: users,
		});
		var currentThread = {
			id: 1,
			name: null,
			participants: [users[0].id],
		}
		// check selectable and selected
		renderedThreadsForm.chekSelectableSelected(currentThread);
		expect(renderedThreadsForm.state.recipientsSelectable).toEqual([users[1], users[2]]);
		expect(renderedThreadsForm.state.recipientsSelected).toEqual([users[0]]);
	});
	
	it('saveRecipients', function(){
		// we ensure the user list is correctly rendered
		var renderedThreadsForm = TestUtils.renderIntoDocument( <ThreadsForm   /> );
		// people in recipientsSelected but not in participants will be added
		renderedThreadsForm.setState({
			currentThread: {
				id: 1,
				name: null,
				participants: [users[0].id],
			},
			recipientsSelected: [users[0], users[1]],	
		});
		
		// we spy
		spyOn(MessageStore, "addThreadParticipants");
		
		// we update the state
		renderedThreadsForm.saveRecipients();
		expect(MessageStore.addThreadParticipants).toHaveBeenCalledWith(1, [users[1].id]);
		
	});
	
	it('saveThreadWithRecipients', function(){
		// we ensure the user list is correctly rendered
		var renderedThreadsForm = TestUtils.renderIntoDocument( <ThreadsForm   /> );
		// people in recipientsSelected but not in participants will be added
		renderedThreadsForm.setState({
			currentThread: {
				id: 0,
				name: null,
				participants: [],
			},
			recipientsSelected: [users[0], users[1]],	
		});
		
		// we spy
		spyOn(MessageStore, "createThread");
		
		// we update the state
		renderedThreadsForm.saveThreadWithRecipients();
		expect(MessageStore.createThread).toHaveBeenCalledWith(null, [users[0].id, users[1].id]);
		
	});
	
	it('saveThreadWithRecipients', function(){
		// we ensure the user list is correctly rendered
		var renderedThreadsForm = TestUtils.renderIntoDocument( <ThreadsForm   /> );
		// people in recipientsSelected but not in participants will be added
		renderedThreadsForm.setState({
			currentThread: {
				id: 0,
				name: null,
				participants: [],
			},
			recipientsSelected: [users[0], users[1]],	
		});
		
		// we spy
		spyOn(MessageStore, "createThread");
		
		// we update the state
		renderedThreadsForm.saveThreadWithRecipients();
		expect(MessageStore.createThread).toHaveBeenCalledWith(null, [users[0].id, users[1].id]);
		
	});
	
	
	
});