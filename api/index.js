import express from 'express'
import redis from 'redis'

require('dotenv').config()

const redisClient = redis.createClient(process.env.REDIS_URL)

const app = express()
app.all('/spotify/data/:key', (req, res) => {
  res.send('Success! 🎉\n')
})

module.exports = {
  path: '/api/',
  handler: app
}
