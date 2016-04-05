
jest.dontMock('object-assign');
jest.dontMock('../MessagesLoadMore');

describe('MessagesLoadMore', function() {
	
	var React;
	var ReactDOM;
	var TestUtils;
	var MessagesLoadMore;
	
	beforeEach(function() {
		React = require('react');
		ReactDOM = require('react-dom');
		TestUtils = require('react-addons-test-utils');
		MessagesLoadMore = require('../MessagesLoadMore');
		MessageStore = require('../../stores/MessageStore');
	});
	
	it('defaults props and state', function(){
		// we instantiate
		var renderedMessagesLoadMore = TestUtils.renderIntoDocument( <MessagesLoadMore/> );
		var messagesLoadMoreNode = ReactDOM.findDOMNode(renderedMessagesLoadMore);

		expect(renderedMessagesLoadMore.props.wrappingTag).toEqual("button");
		expect(renderedMessagesLoadMore.props.wrappingClass).toEqual("messagesMessagesLoadMore btn btn-default btn-sm col-md-12");
		expect(renderedMessagesLoadMore.props.wrappingStyle).toEqual({});
		expect(renderedMessagesLoadMore.props.loadText).toEqual('Load more ...');
		
		// we set a thread and a message result set
		renderedMessagesLoadMore.setState({
			currentThread:{
				id: 1
			},
			messagesResultSet:{
				next: 'abc'
			},
		});
		
		// we click on the button
		var btn = TestUtils.scryRenderedDOMComponentsWithTag(renderedMessagesLoadMore, "button")[0];
		var bntNode = ReactDOM.findDOMNode(btn);
		
		// we spy
		spyOn(MessageStore, "queryMessagesInThread");
		
		TestUtils.Simulate.click(bntNode);
		
		expect(MessageStore.queryMessagesInThread).toHaveBeenCalledWith(1, 'abc');
		
	});
});