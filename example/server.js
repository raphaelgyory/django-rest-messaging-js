require('babel-register')

var express = require('express')
  , app = express()
  , React = require('react')
  , ReactDOMServer = require('react-dom/server')
  , path = require('path')
  , jade = require('jade')
  ;

app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

app.use('/static/dist', express.static(__dirname + '/dist'));
app.use('/static/dist', express.static(path.join(__dirname, '/../django-rest-messaging-js/dist')));

app.get('/', function(req, res){
	
	res.json({
		error: null,
		markup: "Node server",
	});
	
})

app.post('/render', function(req, res) {
	
	var html = jade.renderFile('views/index.jade', {});
	
    res.json({
		error: null,
		markup: html,
	});
		
});

app.listen(process.argv[2], function() {
  console.log('Listening on port ' + process.argv[2]);
})