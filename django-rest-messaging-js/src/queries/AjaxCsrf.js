/*
 * From django doc.
 * This code ensure our queries work with django's CSRF token.
 */

var $ = require('jquery');
	
//var window = require('jsdom').jsdom().createWindow();
//(window);

function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie != '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = $.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) == (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

function csrfSafeMethod(method) {
 	// these HTTP methods do not require CSRF protection
 	return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function ajaxRequestParams(url, type, data) {
	return {
        url: url,
        type: type,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data),
        // The ``X-CSRFToken`` evidently can't be set in the
        // ``headers`` option, so force it here.
        beforeSend: function(xhr, settings) {	 
      	  	var csrftoken = getCookie('csrftoken'); 
      	  	if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
      	  		xhr.setRequestHeader("X-CSRFToken", csrftoken);
      	  	}
        }
	}
}

function ajaxRequest(url, type, data, action) {
	// simple ajax request
	return $.ajax(ajaxRequestParams(url, type, data));
}

module.exports = ajaxRequest;