var React = require('react');
var MessageStore = require('../stores/MessageStore');
var NotificationsCounterNullDefault = require('./NotificationsCounterNullDefault');
var NotificationsCounterDefault = require('./NotificationsCounterDefault');
var ModuleMixins = require('./ModuleMixins');


function getInitialState() {
	return {
		notificationsCount: MessageStore.getNotificationsCount(),
	};
}


var NotificationsCounter = React.createClass({
	
	mixins: [
         ModuleMixins.LoginMixin, 
         ModuleMixins.CurrentThreadMixin,
	],
	
	getDefaultProps: function() {
		return {
			iconClass: "fa fa-envelope fa-lg",
			iconNullDefault: NotificationsCounterNullDefault,
			iconDefault: NotificationsCounterDefault,
	    };
	},
	
	getInitialState: function() {
		return getInitialState();
	},
	
	componentDidMount: function() {
		// we listen to changes in the last messages, because they trigger notifications
		MessageStore.addLastMessageOfAllThreadsChangeListener(this.onChangeMessageList);
	},

	componentWillUnmount: function() {
		MessageStore.removeLastMessageOfAllThreadsChangeListener(this.onChangeMessageList);
	},
	
	render: function() {
		if(this.state.loggedInParticipantId != null) {
			if(this.state.notificationsCount < 1) {
				return <this.props.iconNullDefault classNameNotification={"notificationCounter"} iconClass={this.props.iconClass} notificationsCount={this.state.notificationsCount} />
			} else {
				return <this.props.iconDefault classNameNotification={"notificationCounter"} iconClass={this.props.iconClass} notificationsCount={this.state.notificationsCount} notificationsChecked={this.notificationsChecked} />
			}
		} else {
			return <span className="notificationsUnactivated"></span>
		}
		
	},
	
	onChangeMessageList: function() {
		this.setState({
			notificationsCount: MessageStore.getNotificationsCount(),
		});
	},
	
	notificationsChecked: function() {
		var _this = this;
		MessageStore.
			notificationsChecked().
			done(function(json){
				_this.setState({
					notificationsCount: MessageStore.getNotificationsCount(),
				});
			});
	},
	
});

module.exports = NotificationsCounter;