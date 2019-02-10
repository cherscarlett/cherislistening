import express from 'express'
import redis from 'redis'

require('dotenv').config()

const redisClient = redis.createClient(process.env.REDIS_URL)
// Redis client
redisClient.on('connect', () => {
  console.log('\n🎉 Redis client connected 🎉\n')
})

redisClient.on('error', err => {
  console.error(`\n🚨 Redis client could not connect: ${err} 🚨\n`)
})

const app = express()
// Express app
app.all('/spotify/data/:key', (req, res) => {
  res.send('Success! 🎉\n')
})

module.exports = {
  path: '/api/',
  handler: app
}
