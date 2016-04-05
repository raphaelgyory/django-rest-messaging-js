
var adapters = require('./adapters'); 
var defaultParticipantAdapter = adapters.defaultParticipantAdapter;


var getUserInfo = function(recipientsArray, recipientId, adapter) {
	if(! adapter){
		adapter = defaultParticipantAdapter;
	}

	// gets the info of the user
	var user = {
		id: null,
		image: null,
		username: null,
	};
	
	if(! recipientsArray || recipientsArray.length < 1) {
		// we have no users for iteration, we return an emtpy user
		return user;
	}
	
	for (var i = 0; i < recipientsArray.length; i++) {
		if (recipientsArray[i][adapter.id] == recipientId) {
			for (var key in adapter) {
				if (adapter.hasOwnProperty(key)) {
					user[key] = recipientsArray[i][adapter[key]];
				}
			}
			break;
		}
	}
	return user;
}


var users = {	
	getUserInfo: getUserInfo,
}

module.exports = users;