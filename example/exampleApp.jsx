var React = require('react');
var ReactDOM = require('react-dom');
var DjangoRestMessaging = require('DjangoRestMessaging');
var MessagesManager = DjangoRestMessaging.MessagesManager;
var MessageStore = DjangoRestMessaging.MessageStore;
var ThreadsList = DjangoRestMessaging.ThreadsList;
var MessagesList = DjangoRestMessaging.MessagesList;
var MessagesLoadMore = DjangoRestMessaging.MessagesLoadMore;
var MessagesForm = DjangoRestMessaging.MessagesForm;
var NotificationsCounter = DjangoRestMessaging.NotificationsCounter;
var ThreadsForm = DjangoRestMessaging.ThreadsForm;
var ThreadsCreateLink = DjangoRestMessaging.ThreadsCreateLink;
var ThreadsLoadMore = DjangoRestMessaging.ThreadsLoadMore;
var ThreadsQuit = DjangoRestMessaging.ThreadsQuit;
var ajaxRequest = DjangoRestMessaging.ajaxRequest;
var listeners = DjangoRestMessaging.listeners;

var HowTo = React.createClass({
	
	render: function() {
		
		if(!this.state || ! this.state.loggedInParticipantId){
			return (
				<div>
				 	<div className="page-header">
				 		<h1>Welcome to the Django rest messaging demo!</h1>
					</div>
					<p>
						Start the demo by clicking on the login button in the nav bar (this is a dummy login, it will log you in automatically without credentials).
					</p>
					<p>
						Once logged in, you will be able to post and receive messages in real-time (they are posted automatically via a cron job every 30 to 60 seconds).
					</p>
					<p>
						Envoy :)
					</p>
				</div>
			);
		} else {
			return <span></span>
		}
		
	},
	
	componentDidMount: function() {
		// we listen to the authentication status of the user
		MessageStore.addLoginStatusChangeListener(this.onChangeAuth);
	},

	componentWillUnmount: function() {
		MessageStore.removeLoginStatusChangeListener(this.onChangeAuth);
	},
	
	onChangeAuth: function() {
		this.setState({
			loggedInParticipantId: MessageStore.getLoggedInParticipantId(),
		});
	},
});

var DummyLogin = React.createClass({
	
	render: function() {

		if(this.state && this.state.loggedInParticipantId) {
			return <a>You are logged in as {this.props.users[0].username} &nbsp; <img className="navBarImage" src={this.props.users[0].image}/></a>
				

		} else {
			return (
					<button onClick={this.login} className="btn btn-success btnLogin dummyLogin">Login!</button>
				);
		}
		
	},
	
	login: function() {
		ajaxRequest('/messaging/js/django-rest-messaging-demo-login/', 'GET', null).done(function(json){
			//alert("You are logged in as " + json.user + "! You can now see " + json.user + "'s messages.");
			listeners.loginListener(json.id);
		})
	},
	
	componentDidMount: function() {
		// we listen to the authentication status of the user
		MessageStore.addLoginStatusChangeListener(this.onChangeAuth);
	},

	componentWillUnmount: function() {
		MessageStore.removeLoginStatusChangeListener(this.onChangeAuth);
	},
	
	onChangeAuth: function() {
		this.setState({
			loggedInParticipantId: MessageStore.getLoggedInParticipantId(),
		});
	},
});


var App = React.createClass({
   render: function(){
	   
	   var users = [
       	     {
       	    	 "id": 1,
       	    	 "username": "John",
       	    	 "image": "/static/dist/John.png"
       	     },
       	     {
       	    	 "id": 2,
       	    	 "username": "Steve",
       	    	 "image": "/static/dist/Steve.png"
       	     },
       	     {
       	    	 "id": 3,
       	    	 "username": "Marc",
       	    	 "image": "/static/dist/Marc.png"
       	     },
       	     {
       	    	 "id": 4,
       	    	 "username": "Ada",
       	    	 "image": "/static/dist/Ada.png"
       	     },
       	     {
       	    	 "id": 5,
       	    	 "username": "Pepito",
       	    	 "image": "/static/dist/Pepito.png"
       	     },
       	     {
       	    	 "id": 6,
       	    	 "username": "Pedro",
       	    	 "image": "/static/dist/Pedro.png"
       	     },
       	];
	   
	   listeners.recipientsListener(users);
	   
       return (
    		   <div>
    		   		
    		       <MessagesManager />
    		       
    		       <nav className="navbar navbar-fixed-top">
    		       		<div className="container">
    		       			<div className="navbar-header">
    		       				<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
    		       					<span className="sr-only">Toggle navigation</span>
    		       					<span className="icon-bar"></span>
    		       					<span className="icon-bar"></span>
    		       					<span className="icon-bar"></span>
    		       				</button>
    		       				<a className="navbar-brand" href="#">Django Rest Messaging</a>
    		       			</div>
    		       			<div id="navbar" className="navbar-collapse collapse">
    		       				<ul className="nav navbar-nav">
    		       					<li>
		    		                    <a href="/doc/">The project</a>
		    		                </li>
		    		                <li>
		    		                    <a href="/doc/django-rest-messaging/">REST</a>
		    		                </li>
		    		                <li>
		    		                    <a href="/doc/django-rest-messaging-centrifugo/">Real-time</a>
		    		                </li>
		    		                <li>
		    		                    <a href="/doc/django-rest-messaging-js/">React.js</a>
		    		                </li>
		    		                <li className="active">
		    		                    <a href="#">Demo</a>
		    		                </li>
    		       				</ul>
    		       				<ul className="nav navbar-nav navbar-right">
    		       					<li>
		    		                   	<a href="/doc/django-rest-messaging-js/">
		    		                        <i className="fa fa-arrow-left"></i> Previous
		    		                    </a>
		    		                </li>
		    		                <li className="disabled">
		    		                    <a>
		    		                        Next <i className="fa fa-arrow-right"></i>
		    		                    </a>
		    		                </li>
		    		                
		    		                <li>
		    		                    <a href="https://github.com/raphaelgyory/django-rest-messaging">
		    		                        
		    		                            <i className="fa fa-github"></i>
		    		                        &nbsp;
		    		                        GitHub
		    		                    </a>
		    		                </li>
	    		       		    </ul>
    		       			</div>
    		       		</div>
    		       	</nav>
    		       	<nav className="navbar navbar2">
			       		<div className="container">
			       			<div id="navbar2" className="navbar-collapse collapse">
			       				<ul className="nav navbar-nav navbar-right">
					       			<li className="dropdown">
			       						<a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
			       							<NotificationsCounter />
			       						</a>
			       						<ul className="dropdown-menu">
			       							<ThreadsList wrappingTag={"li"}/>
			       						</ul>
			       					</li>
			       					<li className="navbar-right">
			       						<DummyLogin users={users}/>
			       					</li>
	    		       		    </ul>
			       			</div>
			       		</div>
			       	</nav>
    		    
    		       	<div className="container" role="main">
		    		    <div className="row">
		    		    	<div className="col-md-8">
		    		    		  <HowTo />
				    		      <ThreadsForm />
				    		      <div id="messageMaxHeight">
				    		      	<MessagesLoadMore />
				    		   	  	<MessagesList />
				    		   	  </div>
				    		   	  <MessagesForm />
				    		   	  <ThreadsQuit />
				    		</div>
				    		<div className="col-md-4">
				    			<ThreadsList />
				    			<ThreadsLoadMore />
				    			<ThreadsCreateLink />
			    		    </div>
				    </div>
    		   </div>  
   		    </div>
       );
   }
});

ReactDOM.render(<App/>, document.getElementById('react-app'));

module.exports = App;
