const express = require('express')
const app = express()
const compression = require('compression')
const https = require('https')
const fs = require('fs')


const options = {
  cert: fs.readFileSync('./full_chain.pem'),
  key: fs.readFileSync('./private.key')
}
// 一定这一行代码要写在静态资源托管之前
app.use(compression())
app.use(express.static('./dist'))

app.listen(80, () => {
  console.log('server is running at http://127.0.0.1')
})

// https.createServer(options, app).listen(443)