
jest.dontMock('object-assign');
jest.dontMock('moment');
jest.dontMock('../MessagesList');
jest.dontMock('../../utils/users');

describe('MessagesList', function() {
	
	var React;
	var ReactDOM;
	var TestUtils;
	var MessagesList;
	var MessagesListRowDefaultLayout;
	var MessageStore;
	
	// we simulate data from the store
	var listOfMessages = {
		results: [
		    {
			    "id": 2,
			    "body": "message 2 thread 1",
			    "sender": 2,
			    "thread": 1,
			    "sent_at": "2015-12-10T11:57:15.893000",
			    "is_notification": false,
			    "readers": []
			},
			{
			    "id": 1,
			    "body": "message 1 thread 1",
			    "sender": 1,
			    "thread": 1,
			    "sent_at": "2015-12-10T11:57:15.568000",
			    "is_notification": true,
			    "readers": []
			}
		],
		count: 2,
		next: '/next/url/456/',
		previous: '/previous/url/123/',
	};
	
	
	beforeEach(function() {
		React = require('react');
		ReactDOM = require('react-dom');
		TestUtils = require('react-addons-test-utils');
		MessagesList = require('../MessagesList');
		MessagesListRowDefaultLayout = require('../MessagesListRowDefaultLayout');
		MessageStore = require('../../stores/MessageStore');
		MessageStore.getCurrentThreadPaginatedMessages.mockReturnValue(listOfMessages); // we return default messages from the store
		MessageStore.getLoggedInParticipantId.mockReturnValue(1); // we say the user is logged in
	});
	
	it('defaults props and state', function(){
		// we instantiate
		var renderedMessagesList = TestUtils.renderIntoDocument( <MessagesList/> );
		var messagesListNode = ReactDOM.findDOMNode(renderedMessagesList);

		// by default, the content is rendered in a div with class "wrappingClass"
		expect(renderedMessagesList.props.wrappingTag).toEqual('div');
		expect(messagesListNode.tagName).toEqual("DIV");
		expect(renderedMessagesList.props.wrappingClass).toEqual('messagesMessagesList');
		expect(messagesListNode.classList[0]).toEqual('messagesMessagesList');
		expect(renderedMessagesList.props.wrappingStyle).toEqual({});
		
		// by default, we use the default layout for each row, which can receive additionnal data
		expect(renderedMessagesList.props.layoutForListRows.displayName).toEqual('MessagesListRowDefaultLayout');
		expect(renderedMessagesList.props.layoutAdditionnalInfo).toEqual({});
		
		// the component gets data from the store
		expect(renderedMessagesList.state.messagesResultSet).toEqual(listOfMessages);
		
		// the components renders with its mapped props.layoutForListRows as child
		var children = TestUtils.scryRenderedComponentsWithType(renderedMessagesList, renderedMessagesList.props.layoutForListRows);
		expect(children[0].props.message).toEqual(listOfMessages.results[0]);
		expect(children[1].props.message).toEqual(listOfMessages.results[1]);
		// we ensure the props are passed as expected
		expect(children[0].props.layoutAdditionnalInfo).toEqual(renderedMessagesList.props.layoutAdditionnalInfo);
		expect(children[1].props.layoutAdditionnalInfo).toEqual(renderedMessagesList.props.layoutAdditionnalInfo);
		expect(children[0].props.layoutStyle).toEqual({});
	});
	
	it('login status', function(){
		// we say the user is not logged in
		MessageStore.getLoggedInParticipantId.mockReturnValue(null);
		var renderedMessagesList = TestUtils.renderIntoDocument( <MessagesList/> );
		var messagesListNode = ReactDOM.findDOMNode(renderedMessagesList);
		expect(messagesListNode.classList[0]).toEqual('messagesMessagesListUnauthenticated');
	});
	
	it('login state', function(){
		// we start with a logged in user
		var renderedMessagesList = TestUtils.renderIntoDocument( <MessagesList/> );
		var messagesListNode = ReactDOM.findDOMNode(renderedMessagesList);
		expect(messagesListNode.classList[0]).toEqual('messagesMessagesList');
		// we ensure the component listens to the login status of the user on logout
		renderedMessagesList.setState({loggedInParticipantId: null});
		expect(messagesListNode.classList[0]).toEqual('messagesMessagesListUnauthenticated');
		// we ensure the component listens to the login status of the user on login
		renderedMessagesList.setState({loggedInParticipantId: 1});
		expect(messagesListNode.classList[0]).toEqual('messagesMessagesList');
	});
	
	it('thread list state', function(){
		// we start with the children from beforeRender
		var renderedMessagesList = TestUtils.renderIntoDocument( <MessagesList/> );
		// we make changes in the store
		renderedMessagesList.setState({
			messagesResultSet : {
				results: [],
				count: 0,
				next: null,
				previous: null,
			}
		});
		var children = TestUtils.scryRenderedComponentsWithType(renderedMessagesList, renderedMessagesList.props.layoutForListRows);
		expect(children.length).toEqual(0);
	});
});