var React = require('react');
var users = require('../utils/users');
var getUserInfo = users.getUserInfo;


var ThreadsListRowDefaultLayout = React.createClass({
	
	render: function() {
		
		if(this.props.message && this.props.message.body && this.props.message.body.length > 70){
			var body = this.props.message.body.substring(0,70) + " ...";
		} else{
			var body = this.props.message.body;
		}

		var userInfo = getUserInfo(this.props.recipients, this.props.message.sender, this.props.participantAdapter);
		
		var isNotification = '';
		if (this.props.message.is_notification == true){
			isNotification = "threadIsNotification";
		}
		
		// the thread is unread if it does not include the current participant
		// and thread is not the id of the current selected thread
		var isUnread = '';
		if(this.props.message.readers && this.props.message.readers.indexOf(this.props.loggedInParticipantId) == -1 &&
				this.props.message.thread != this.props.currentThread.id &&
				this.props.message.sender != this.props.loggedInParticipantId){
			isUnread = "threadIsUnread";
		}
		
		if(this.props.loggedInParticipantId)
		
		return (
			<div className={"threadListLayout " + isNotification + " " + isUnread} onClick={this.props.onClickThreadSelected}>
				<img src={userInfo.image} className="threadListLayoutImage"/>
				<span className="threadListLayoutBody">{body}</span>
			</div>
		);
		
	},
	
});

module.exports = ThreadsListRowDefaultLayout;