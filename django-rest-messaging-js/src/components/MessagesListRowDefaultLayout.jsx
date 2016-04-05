var React = require('react');
var users = require('../utils/users');
var getUserInfo = users.getUserInfo;
var moment = require('moment');

var MessagesListRowDefaultLayout = React.createClass({
	
	render: function() {
				
		if(this.props.sentByCurrentParticipant){
			var className = "messageList messageSentByCurrentParticipant";
		} else {
			var className = "messageList messageSentByOtherParticipant";
		}
		
		var userInfo = getUserInfo(this.props.recipients, this.props.message.sender, this.props.participantAdapter);
		
		return (
			<div className={className}>
				<div className="messageListCore">
					<img src={userInfo.image} className="messageListLayoutImage"/>
					<span className="messageListLayoutBody">{this.props.message.body}</span>
				</div>
				<div className="messageListLayoutDate">{userInfo.username}, {moment(this.props.message.sent_at).format('MMMM Do YYYY, h:mm:ss a')}</div>
			</div>
		);
		
	},
	
});

module.exports = MessagesListRowDefaultLayout;