const merge = require('webpack-merge');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const webpackClientCommon = require('./webpack.client.common.js');

module.exports = merge.strategy({
})(webpackClientCommon, {
    mode: 'production',
    // devtool: "source-map",
});