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
    const { key } = req.params
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
    res.send(err)
  }
})

const callStorage = (method, ...args) => redisClient[method](...args)

app.get('/spotify/callback', async req => {
  try {
    const { code } = req.query
    const { access_token, refresh_token } = await getSpotifyToken({
      code,
      grant_type: 'authorization_token'
    })
    const { id } = await getUserData(access_token)
    if (id !== process.env.SPOTIFY_USER_ID)
      throw Error("You aren't the droid we're looking for.")
    const reply = postToRedis('refresh_token', { value: refresh_token })
    console.log(`🗄️ Reponse from redis: ${reply}🗄️`)
  } catch (err) {
    console.error(
      `\n🚨 There was an error at /api/spotify/callback: ${err} 🚨\n`
    )
  }
})

const spotifyAuthUrl = 'https://accounts.spotify.com/'

const getSpotifyToken = props =>
  axios({
    method: 'post',
    url: `${spotifyAuthUrl}api/token`,
    params: {
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      redirect_uri: `${process.env.CLIENT_URL}/api/spotify/callback`,
      ...props
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

const spotifyBaseUrl = 'https://api.spotify.com/v1/'

const getUserData = access_token =>
  axios.get(`${spotifyBaseUrl}me`, {
    headers: {
      withCredentials: true,
      Authorization: `Bearer ${access_token}`
    }
  })

function postToRedis(key, keys) {
  const { body, value } = keys
  return axios({
    method: 'post',
    url: `/api/spotify/data/${key}${value ? `?value=${value}` : ''}`,
    body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

module.exports = {
  path: '/api/',
  handler: app
}
