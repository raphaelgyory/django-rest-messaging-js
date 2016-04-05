var path = require("path")
var webpack = require('webpack')
var BundleTracker = require('webpack-bundle-tracker')

module.exports = {
	context: __dirname,

	entry: './example/exampleApp',

	output: {
		path: path.resolve(__dirname + '/example/dist'),
		filename: "example-django-rest-messaging-1.0.1.js",
		libraryTarget: "var",
		// name of the global var: "DjangoRestMessaging"
		library: "exampleAppDjangoRestMessaging",
	},
	
	externals: {
	    // require("jquery") is external and available
	    // on the global var jQuery
	    "jquery": "jQuery",
	    "jquery": "$",
	    // same for react
        "react": "React",
	    // our library is also available
	    "DjangoRestMessaging": "DjangoRestMessaging",
	},
	
	plugins: [
	    new BundleTracker({filename: './webpack-stats-example.json'}),
	    
	    // removes a lot of debugging code in React
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			},
			IN_BROWSER: true,
		}),
		
		// keeps hashes consistent between compilations
		new webpack.optimize.OccurenceOrderPlugin(),
		
		new webpack.optimize.UglifyJsPlugin({
			compressor: {
				warnings: false
			}
		})
	],
	
	module: {
		loaders: [
		    { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader', query: { presets:['react'] }},
	        { test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader', query: { presets:['react'] }},
	        { test: /\.json$/, loader: "json-loader" },
	    ],
	},

	resolve: {
		root: path.resolve('./django-rest-messaging-js'),
		modulesDirectories: ['node_modules', 'bower_components'],
		extensions: ['', '.js', '.jsx'],
	},
	
}