import express from 'express'

const app = express()

app.all('/spotify/data/:key', (req, res) => {
  res.send('Success! 🎉\n')
})

module.exports = {
  path: '/api/',
  handler: app
}
