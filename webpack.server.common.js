const merge = require('webpack-merge');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const webpackCommon = require('./webpack.common.js');

var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = merge(webpackCommon, {
    entry: [
        './server.ts'
    ],

    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist/server"),
        publicPath: '/'
    },

    target: 'node',

    plugins: [
        new CleanWebpackPlugin(['dist/server'])
    ],

    externals: nodeModules

});