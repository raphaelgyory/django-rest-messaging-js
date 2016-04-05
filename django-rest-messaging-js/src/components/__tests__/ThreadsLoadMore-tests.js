
jest.dontMock('object-assign');
jest.dontMock('../ThreadsLoadMore');

describe('ThreadsLoadMore', function() {
	
	var React;
	var ReactDOM;
	var TestUtils;
	var ThreadsLoadMore;
	
	beforeEach(function() {
		React = require('react');
		ReactDOM = require('react-dom');
		TestUtils = require('react-addons-test-utils');
		ThreadsLoadMore = require('../ThreadsLoadMore');
		MessageStore = require('../../stores/MessageStore');
	});
	
	it('defaults props and state', function(){
		// we instantiate
		var renderedThreadsLoadMore = TestUtils.renderIntoDocument( <ThreadsLoadMore/> );
		var threadsLoadMoreNode = ReactDOM.findDOMNode(renderedThreadsLoadMore);

		expect(renderedThreadsLoadMore.props.wrappingTag).toEqual("button");
		expect(renderedThreadsLoadMore.props.wrappingClass).toEqual("messagesThreadsLoadMore btn btn-default btn-sm col-md-12");
		expect(renderedThreadsLoadMore.props.wrappingStyle).toEqual({});
		expect(renderedThreadsLoadMore.props.loadText).toEqual('Load more ...');
		
		// we set a thread and a message result set
		renderedThreadsLoadMore.setState({
			loggedInParticipantId: 1,
			lastMessagesResultSet:{
				next: 'abc'
			},
		});
		
		// we click on the button
		var btn = TestUtils.scryRenderedDOMComponentsWithTag(renderedThreadsLoadMore, "button")[0];
		var bntNode = ReactDOM.findDOMNode(btn);
		
		// we spy
		spyOn(MessageStore, "queryLastMessageOfAllThreads");
		
		TestUtils.Simulate.click(bntNode);
		
		expect(MessageStore.queryLastMessageOfAllThreads).toHaveBeenCalledWith('abc');
		
	});
});