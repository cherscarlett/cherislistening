import express from 'express'
import redis from 'async-redis'
import axios from 'axios'

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
app.use(express.json())
// Express app
app.all('/spotify/data/:key', async (req, res) => {
  try {
    const key = req.params.key
    const value = req.query.value
      ? `${req.query.value}`
      : (Object.keys(req.body).length !== 0 && JSON.stringify(req.body)) || null
    const args = [
      Boolean(value) ? 'hset' : 'hget',
      'spotify',
      key,
      value
    ].filter(arg => Boolean(arg))
    const reply = await callStorage(...args)
    res.send({ [key]: reply })
  } catch (err) {
    console.error(`\n🚨 There was an error at /api/spotify/data: ${err} 🚨\n`)
    res.send({ error: err })
  }
})

const callStorage = (method, ...args) => redisClient[method](...args)

module.exports = {
  path: '/api/',
  handler: app
}
