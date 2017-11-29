const webpack = require('webpack');
const path = require('path');

console.log(path.join(__dirname, "dist"))
var clientConfig = {
    entry: [
        // 'react-hot-loader/patch',
        'webpack-hot-middleware/client',
        './src/client/index.tsx'
    ],

    output: {
        filename: "bundle.js",
        path: path.join(__dirname, "dist"),
        publicPath: '/dist/'
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        // new webpack.NoEmitOnErrorsPlugin()
    ],

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre",
                test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // },
};

// In future beneath code should be changes, see for more information: http://stackoverflow.com/questions/29911491/using-webpack-on-server-side-of-nodejs
// and look at this library: "webpack-node-externals".
// var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

var serverConfig = {
    entry: "./server.ts",
    // entry: './server.js',
    output: {
        filename: "./server.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/dist/"
    },
    target: 'node',

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        // noParse: ['ws'],
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre",
                test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    externals: nodeModules

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // },
};

// module.exports = [clientConfig] // Disabled server config for a while  //, serverConfig];
// module.exports = [clientConfig, serverConfig]
module.exports = [serverConfig]
// module.exports = [clientConfig]
// module.exports = clientConfig