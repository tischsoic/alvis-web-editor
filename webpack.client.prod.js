const merge = require('webpack-merge');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const webpackClientCommon = require('./webpack.client.common.js');

module.exports = merge.strategy({
})(webpackClientCommon, {

    // devtool: "source-map",

    plugins: [
        new UglifyJsPlugin({
            // sourceMap: true
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],

});