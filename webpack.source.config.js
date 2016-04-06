/*
 * This files packs the source of the django-rest-messaging-js app.
 */

var path = require("path")
var webpack = require('webpack')
var BundleTracker = require('webpack-bundle-tracker')

module.exports = {
	context: __dirname,

	entry: './django-rest-messaging-js/src/DjangoRestMessaging',

	output: {
		path: path.resolve(__dirname + '/django-rest-messaging-js/dist'),
		filename: "django-rest-messaging-1.0.1.js",
		//export itself to a global var
		libraryTarget: "var",
		// name of the global var: "DjangoRestMessaging"
		library: "DjangoRestMessaging",
	},
	
	externals: {
	    // require("jquery") is external and available
	    // on the global var jQuery
	    "jquery": "jQuery",
	    "jquery": "$",
	    "react": "React",
	    "moment": "moment"
	},
	
	plugins: [
	    new BundleTracker({filename: './webpack-stats-source.json'}),
	    
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