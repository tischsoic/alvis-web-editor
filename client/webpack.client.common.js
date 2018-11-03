const merge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const webpackCommon = require('./webpack.common.js');

module.exports = merge(webpackCommon, {
    entry: [
        './src/index.tsx'
    ],

    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "./dist"),
        publicPath: '/'
    },

    plugins: [
        new CleanWebpackPlugin(['./dist']),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.template.html'),
            filename: 'index.html',
        }),
    ],

});