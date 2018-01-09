const express = require('express')
const history = require('connect-history-api-fallback')
const cors = require('cors')
const proxyMiddleware = require('http-proxy-middleware')
const path = require('path');

const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const app = express()
const config = require('./webpack.client.dev')
const compiler = webpack(config)


app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}))

app.use(webpackHotMiddleware(compiler))

// app.use(cors()) // TO DO: Do We need this

app.use(proxyMiddleware('/server', {
  target: 'http://localhost:3001',
  pathRewrite: {
    '^/server': '/server'
  }
}))

// app.use(history({
//   index: '/index.html'
// }))

app.use('/public', express.static('static'))
// app.use(express.static('dist'))

// console.log(path.join(__dirname, "dist"))
// By nie uruchamial sie webpack
// app.use(require('webpack-dev-middleware')(compiler, {
//   // noInfo: true,
//   path: '/dist/',
//   publicPath: config[0].output.publicPath
// }))

// app.use(express.static(config[0].output.path))
// console.log(config[0].output.publicPath);

app.listen(3000, '0.0.0.0', (err) => {
  if (err) {
    console.log(err)
    return
  }

  console.log('Listening on port 3000')
})

