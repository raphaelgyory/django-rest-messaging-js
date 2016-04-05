var React = require('react');


var NotificationsCounterDefault = React.createClass({
	
	getDefaultProps: function() {
		return {
			iconClass: "fa fa-envelope fa-lg"
	    };
	},
	
	render: function() {
		
		return	(
			<span className={this.props.classNameNotification} onClick={this.props.notificationsChecked}>  
				<i className={this.props.iconClass + " notificationCounterPositiveIcon"}></i>
				<span className={"notificationCounterPositiveCount"}>{this.props.notificationsCount}</span>
			</span>
		);
		
	},
	
});

module.exports = NotificationsCounterDefault;