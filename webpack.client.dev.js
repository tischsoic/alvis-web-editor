const merge = require('webpack-merge');
const webpack = require('webpack');

const webpackClientCommon = require('./webpack.client.common.js');

module.exports = merge.strategy({
    entry: 'prepend'
})(webpackClientCommon, {
    entry: [
        'react-hot-loader/patch',
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000'
    ],

    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
        ignored: /node_modules/
    },

    devtool: "source-map",

    plugins: [
        new webpack.HotModuleReplacementPlugin()    
    ],

});