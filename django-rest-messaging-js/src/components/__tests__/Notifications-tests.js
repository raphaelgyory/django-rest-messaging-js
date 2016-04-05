
jest.dontMock('object-assign');
jest.dontMock('../NotificationsCounter');
jest.dontMock('../NotificationsCounterDefault');
jest.dontMock('../NotificationsCounterNullDefault');


describe('NotificationsCounter', function() {
	
	var React;
	var ReactDOM;
	var NotificationsCounter;
	var NotificationsCounterDefault;
	var NotificationsCounterNullDefault;
	var MessageStore;

	beforeEach(function() {
		React = require('react');
		ReactDOM = require('react-dom');
		TestUtils = require('react-addons-test-utils');
		NotificationsCounter = require('../NotificationsCounter');
		NotificationsCounterDefault = require('../NotificationsCounterDefault');
		NotificationsCounterNullDefault = require('../NotificationsCounterNullDefault');
		MessageStore = require('../../stores/MessageStore');
		MessageStore.getNotificationsCount.mockReturnValue(0); // by default we have no notification
		MessageStore.getLoggedInParticipantId.mockReturnValue(1); // by default participant 1 is logged in
	});
	
	it('defaults props', function(){
		// we instantiate
		var renderedNotificationsCounter = TestUtils.renderIntoDocument( <NotificationsCounter /> );
		var notificationsCounterNode = ReactDOM.findDOMNode(renderedNotificationsCounter);
		
		// by default, the content is rendered in a div with class "wrappingClass"
		expect(renderedNotificationsCounter.props.iconClass).toEqual("fa fa-envelope fa-lg");
		expect(renderedNotificationsCounter.props.iconNullDefault).toEqual(NotificationsCounterNullDefault);
		expect(renderedNotificationsCounter.props.iconDefault).toEqual(NotificationsCounterDefault);

		// the child sould be the one specified in the props
		var children = TestUtils.scryRenderedComponentsWithType(renderedNotificationsCounter, NotificationsCounterNullDefault);
		expect(children[0].props.iconClass).toEqual("fa fa-envelope fa-lg");
	});
	
	it('with notification', function(){
		MessageStore.getNotificationsCount.mockReturnValue(1); // by default we have no notification
		// we instantiate
		var renderedNotificationsCounter = TestUtils.renderIntoDocument( <NotificationsCounter /> );
		var notificationsCounterNode = ReactDOM.findDOMNode(renderedNotificationsCounter);
		// the child sould be the one specified in the props
		var children = TestUtils.scryRenderedComponentsWithType(renderedNotificationsCounter, NotificationsCounterDefault);
		expect(children[0].props.iconClass).toEqual("fa fa-envelope fa-lg");
		expect(children[0].props.notificationsChecked).toEqual(renderedNotificationsCounter.notificationsChecked);
	});
	
});