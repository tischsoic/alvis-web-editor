const merge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const webpackCommon = require('./webpack.common.js');

module.exports = merge(webpackCommon, {
    entry: [
        './src/client/index.tsx'
    ],

    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist/client"),
        publicPath: '/'
    },

    plugins: [
        new CleanWebpackPlugin(['dist/client']),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/client/index.template.html'),
            filename: 'index.html',
        }),
    ],

});