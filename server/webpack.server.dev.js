const merge = require('webpack-merge');
const webpack = require('webpack');

const webpackServerCommon = require('./webpack.server.common.js');

module.exports = merge.strategy({
    entry: 'prepend'
})(webpackServerCommon, {

});