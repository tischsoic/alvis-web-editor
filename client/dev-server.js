const express = require('express')
const history = require('connect-history-api-fallback')
const proxyMiddleware = require('http-proxy-middleware')
const path = require('path');

const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const app = express()
const config = require('./webpack.client.dev')
const compiler = webpack(config)

app.use(history({
  // logger: console.log.bind(console)
}))


app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  watchOptions: config.watchOptions
}))

app.use(webpackHotMiddleware(compiler))

// app.use(cors()) // TO DO: Do We need this

app.use(proxyMiddleware('/server', {
  target: 'http://backend:3001',
  pathRewrite: {
    '^/server': '/server'
  }
}))



app.use('/public', express.static('./static'))
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


// app.use(function (req, res, next) {
//   const reqPath = req.url
//   // find the file that the browser is looking for
//   const file = _.last(reqPath.split('/').last)
//   if (['bundle.js', 'index.html'].indexOf(file) !== -1) {
//     res.end(devMiddleware.fileSystem.readFileSync(path.join(config.output.path, file)))
//   } else if (!file || file.indexOf('.') === -1) {
//     // if the url does not have an extension, assume they've navigated to something like /home and want index.html
//     res.end(devMiddleware.fileSystem.readFileSync(path.join(config.output.path, 'index.html')))
//   } else {
//     next()
//   }
// })

app.listen(3000, '0.0.0.0', (err) => {
  if (err) {
    console.log(err)
    return
  }

  console.log('Listening on port 3000')
})

