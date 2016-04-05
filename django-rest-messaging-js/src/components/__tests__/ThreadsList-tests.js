
jest.dontMock('object-assign');
jest.dontMock('../ThreadsList');
jest.dontMock('../../utils/users');


describe('ThreadsList', function() {
	
	var React;
	var ReactDOM;
	var TestUtils;
	var ThreadsList;
	var ThreadsListRowDefaultLayout;
	var MessageStore;
	
	// we simulate data from the store
	var threadsMessages = {
		results: [
		    {
			    "id": 2,
			    "body": "message thread 2",
			    "sender": 1,
			    "thread": 2,
			    "sent_at": "2015-12-10T11:57:15.893000",
			    "is_notification": false,
			    "readers": []
			},
			{
			    "id": 1,
			    "body": "message thread 1",
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
		ThreadsList = require('../ThreadsList');
		ThreadsListRowDefaultLayout = require('../ThreadsListRowDefaultLayout');
		MessageStore = require('../../stores/MessageStore');
		MessageStore.getLastMessageOfAllThreads.mockReturnValue(threadsMessages); // we return default messages from the store
		MessageStore.getLoggedInParticipantId.mockReturnValue(1); // we say the user is logged in
		MessageStore.getCurrentThread.mockReturnValue({
			id:1,
			name:"null",
			participants:[1, 2]
		}); // we set a current thread
	});
	
	it('defaults props and state', function(){
		// we instantiate
		var renderedThreadsList = TestUtils.renderIntoDocument( <ThreadsList/> );
		var threadsListNode = ReactDOM.findDOMNode(renderedThreadsList);

		// by default, the content is rendered in a div with class "wrappingClass"
		expect(renderedThreadsList.props.wrappingTag).toEqual('div');
		expect(threadsListNode.tagName).toEqual("DIV");
		expect(renderedThreadsList.props.wrappingClass).toEqual('messagesThreadsList');
		expect(threadsListNode.classList[0]).toEqual('messagesThreadsList');
		expect(renderedThreadsList.props.wrappingStyle).toEqual({});
		
		// by default, we use the default layout for each row, which can receive additionnal data
		expect(renderedThreadsList.props.layoutForListRows.displayName).toEqual('ThreadsListRowDefaultLayout');
		expect(renderedThreadsList.props.layoutAdditionnalInfo).toEqual({});
		
		// the component gets data from the store
		expect(renderedThreadsList.state.lastMessagesResultSet).toEqual(threadsMessages);
		
		// the components renders with its mapped props.layoutForListRows as child
		var children = TestUtils.scryRenderedComponentsWithType(renderedThreadsList, renderedThreadsList.props.layoutForListRows);
		expect(children[0].props.message).toEqual(threadsMessages.results[0]);
		expect(children[1].props.message).toEqual(threadsMessages.results[1]);
		// we ensure the props are passed as expected
		expect(children[0].props.layoutAdditionnalInfo).toEqual(renderedThreadsList.props.layoutAdditionnalInfo);
		expect(children[1].props.layoutAdditionnalInfo).toEqual(renderedThreadsList.props.layoutAdditionnalInfo);
		expect(children[0].props.layoutStyle).toEqual({});
	});
	
	it('login status', function(){
		// we say the user is not logged in
		MessageStore.getLoggedInParticipantId.mockReturnValue(null);
		var renderedThreadsList = TestUtils.renderIntoDocument( <ThreadsList/> );
		var threadsListNode = ReactDOM.findDOMNode(renderedThreadsList);
		expect(threadsListNode.classList[0]).toEqual('messagesThreadsListUnauthenticated');
	});
	
	it('login state', function(){
		// we start with a logged in user
		var renderedThreadsList = TestUtils.renderIntoDocument( <ThreadsList/> );
		var threadsListNode = ReactDOM.findDOMNode(renderedThreadsList);
		expect(threadsListNode.classList[0]).toEqual('messagesThreadsList');
		// we ensure the component listens to the login status of the user on logout
		renderedThreadsList.setState({loggedInParticipantId: null});
		expect(threadsListNode.classList[0]).toEqual('messagesThreadsListUnauthenticated');
		// we ensure the component listens to the login status of the user on login
		renderedThreadsList.setState({loggedInParticipantId: 1});
		expect(threadsListNode.classList[0]).toEqual('messagesThreadsList');
	});
	
	it('thread list state', function(){
		// we start with the children from beforeRender
		var renderedThreadsList = TestUtils.renderIntoDocument( <ThreadsList/> );
		// we make changes in the store
		renderedThreadsList.setState({
			lastMessagesResultSet : {
				results: [],
				count: 0,
				next: null,
				previous: null,
			}
		});
		var children = TestUtils.scryRenderedComponentsWithType(renderedThreadsList, renderedThreadsList.props.layoutForListRows);
		expect(children.length).toEqual(0);
	});
});