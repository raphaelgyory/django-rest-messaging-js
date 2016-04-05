
jest.dontMock('object-assign');
jest.dontMock('../ThreadsQuit');

describe('ThreadsQuit', function() {
	
	var React;
	var ReactDOM;
	var TestUtils;
	var ThreadsLoadMore;
	
	beforeEach(function() {
		React = require('react');
		ReactDOM = require('react-dom');
		TestUtils = require('react-addons-test-utils');
		ThreadsQuit = require('../ThreadsQuit');
		MessageStore = require('../../stores/MessageStore');
	});
	
	it('defaults props and state', function(){
		// we instantiate
		var renderedThreadsQuit = TestUtils.renderIntoDocument( <ThreadsQuit/> );
		var threadsQuitNode = ReactDOM.findDOMNode(renderedThreadsQuit);

		expect(renderedThreadsQuit.props.wrappingTag).toEqual("a");
		expect(renderedThreadsQuit.props.wrappingClass).toEqual("messagesThreadsQuit");
		expect(renderedThreadsQuit.props.wrappingStyle).toEqual({});
		expect(renderedThreadsQuit.props.quitText).toEqual('Quit this thread');
		
		// we set a thread and a message result set
		renderedThreadsQuit.setState({
			loggedInParticipantId: 1,
			currentThread:{
				id:1,
				name: null,
				participants:[1],
			},
		});
		
		// we click on the button
		var btn = TestUtils.scryRenderedDOMComponentsWithTag(renderedThreadsQuit, "a")[0];
		var bntNode = ReactDOM.findDOMNode(btn);
		
		// we spy
		spyOn(MessageStore, "quitCurrentThread");
		
		TestUtils.Simulate.click(bntNode);
		
		expect(MessageStore.quitCurrentThread).toHaveBeenCalledWith(1);
		
	});
});