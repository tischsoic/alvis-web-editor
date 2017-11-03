const _ = require('lodash')
const express = require('express')
const history = require('connect-history-api-fallback')
const config = require('./webpack.config')
const webpack = require('webpack')
const cors = require('cors')
const proxyMiddleware = require('http-proxy-middleware')
const path = require('path');


const app = express()
app.use(cors())

const compiler = webpack(config)

app.use(history({
  index: '/index.html'
}))

app.use(express.static('static'))
app.use(express.static('dist'))

console.log(path.join(__dirname, "dist"))
// By nie uruchamial sie webpack
// app.use(require('webpack-dev-middleware')(compiler, {
//   // noInfo: true,
//   path: '/dist/',
//   publicPath: config[0].output.publicPath
// }))

app.use(express.static(config[0].output.path))
console.log(config[0].output.publicPath);

app.use(require('webpack-hot-middleware')(compiler))

app.use(proxyMiddleware('/server', {
  target: 'http://localhost:3001',
  pathRewrite: {
    '^/server': ''
  }
}))

app.listen(3000, '0.0.0.0', (err) => {
  if (err) {
    console.log(err)
    return
  }

  console.log('Listening on port 3000')
})

