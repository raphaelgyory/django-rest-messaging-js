var React = require('react');


var NotificationsCounterNullDefault = React.createClass({
	
	getDefaultProps: function() {
		return {
			iconClass: "fa fa-envelope fa-lg"
	    };
	},
	
	render: function() {
		
		return	(
			<span className={this.props.classNameNotification}>
				<i className={this.props.iconClass}></i>
			</span>
		);
		
	},
	
});

module.exports = NotificationsCounterNullDefault;