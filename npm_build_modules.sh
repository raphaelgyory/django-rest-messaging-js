#!/usr/bin/env bash

# the node modules are not located at the same places

# the webpack config files
npm install

# the project's source
cd django-rest-messaging-js
npm install
./node_modules/.bin/webpack --config ../webpack.source.config.js
cd ..

# the project's example application
cd example
npm install
./node_modules/.bin/webpack --config ../webpack.example.config.js
cd ..
