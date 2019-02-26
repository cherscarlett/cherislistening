import express from 'express'
import redis from 'async-redis'
import axios from 'axios'

require('dotenv').config()

const app = express()
app.use(express.json())

// Redis

function connectToRedis() {
  const redisClient = redis.createClient(process.env.REDIS_URL)
  redisClient.on('connect', () => {
    console.log('\n🎉 Redis client connected 🎉\n')
  })
  redisClient.on('error', err => {
    console.error(`\n🚨 Redis client could not connect: ${err} 🚨\n`)
  })
  return redisClient
}

// Express app

app.all('/spotify/data/:key', async ({ params: { key }, query }, res) => {
  try {
    if (key === ('refresh_token' || 'access_token'))
      throw { error: '🔒 Cannot get protected stores. 🔒' }
    const { value } = query
    const reply = await callStorage(...storageArgs(key, { value }))
    res.send({ [key]: reply })
  } catch (err) {
    console.error(`\n🚨 There was an error at /api/spotify/data: ${err} 🚨\n`)
    res.send(err)
  }
})

function storageArgs(key, props) {
  const { expires, body, value } = props
  const val = Boolean(body) ? JSON.stringify(body) : value
  return [
    Boolean(val) ? 'set' : 'get',
    key,
    val,
    Boolean(expires) ? 'EX' : null,
    expires
  ].filter(arg => Boolean(arg))
}

async function callStorage(method, ...args) {
  const redisClient = connectToRedis()
  const response = await redisClient[method](...args)
  redisClient.quit()
  return response
}

app.get('/spotify/callback', async ({ query: { code } }, res) => {
  try {
    const { data } = await getSpotifyToken({
      code,
      grant_type: 'authorization_code'
    })
    const { access_token, refresh_token, expires_in } = data
    const {
      data: { id }
    } = await getUserData(access_token)

    if (id !== process.env.SPOTIFY_USER_ID)
      throw "🤖 You aren't the droid we're looking for. 🤖"

    callStorage(...storageArgs('is_connected', { value: true }))
    callStorage(...storageArgs('refresh_token', { value: refresh_token }))
    callStorage(
      ...storageArgs('access_token', {
        value: access_token,
        expires: expires_in
      })
    )

    const success = '🎉 Welcome Back 🎉'
    res.redirect(`/auth?success=${success}`)
  } catch (err) {
    console.error(
      `\n🚨 There was an error at /api/spotify/callback: ${err} 🚨\n`
    )
    res.redirect(`/auth?message=${err}`)
  }
})

const getSpotifyToken = (props = {}) =>
  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
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

async function getAccessToken() {
  const redisClient = connectToRedis()
  const accessTokenObj = { value: await redisClient.get('access_token') }
  if (!Boolean(accessTokenObj.value)) {
    const refresh_token = await redisClient.get('refresh_token')
    const {
      data: { access_token, expires_in }
    } = await getSpotifyToken({
      refresh_token,
      grant_type: 'refresh_token'
    })
    Object.assign(accessTokenObj, {
      value: access_token,
      expires: expires_in
    })
    callStorage(...storageArgs('access_token', { ...accessTokenObj }))
  }
  redisClient.quit()
  return accessTokenObj.value
}

app.get('/spotify/now-playing/', async (req, res) => {
  try {
    const access_token = await getAccessToken()
    const response = await axios.get(
      `${spotifyBaseUrl}me/player/currently-playing?market=US`,
      {
        headers: {
          withCredentials: true,
          Authorization: `Bearer ${access_token}`
        }
      }
    )
    const { data } = response
    setLastPlayed(access_token, data)
    const reply = await callStorage('get', 'last_played')
    res.send({
      item: JSON.parse(reply),
      is_playing: Boolean(data.is_playing),
      progress_ms: data.progress_ms || 0
    })
  } catch (err) {
    console.error(err)
    res.send({ error: err.message })
  }
})

async function setLastPlayed(access_token, item) {
  if (!Boolean(item)) {
    const { data } = await axios.get(
      `${spotifyBaseUrl}me/player/recently-played?market=US`,
      {
        headers: {
          withCredentials: true,
          Authorization: `Bearer ${access_token}`
        }
      }
    )
    postStoredTrack(data.items[0].track)
  } else {
    postStoredTrack(item.item)
  }
}

function postStoredTrack(props) {
  callStorage(
    ...storageArgs('last_played', {
      body: props
    })
  )
}

module.exports = {
  path: '/api/',
  handler: app
}
