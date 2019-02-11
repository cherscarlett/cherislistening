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
    const { expires } = req.query
    const value = req.query.value
      ? `${req.query.value}`
      : (Object.keys(req.body).length !== 0 && JSON.stringify(req.body)) || null
    const args = [
      Boolean(value) ? 'set' : 'get',
      key,
      value,
      Boolean(expires) ? 'EX' : null,
      expires
    ].filter(arg => Boolean(arg))
    const reply = await callStorage(...args)
    res.send({ [key]: reply })
  } catch (err) {
    console.error(`\n🚨 There was an error at /api/spotify/data: ${err} 🚨\n`)
    res.send(err)
  }
})

const callStorage = (method, ...args) => redisClient[method](...args)

app.get('/spotify/callback', async (req, res) => {
  try {
    const { code } = req.query
    const { data } = await getSpotifyToken({
      code,
      grant_type: 'authorization_code'
    })
    const { access_token, refresh_token, expires_in } = data
    const userData = await getUserData(access_token)
    const { id } = userData.data
    if (id !== process.env.SPOTIFY_USER_ID)
      throw Error("You aren't the droid we're looking for.")
    postToRedis('refresh_token', { value: refresh_token })
    postToRedis('access_token', { value: access_token, expires: expires_in })
    res.redirect('/auth?status=success')
  } catch (err) {
    console.error(
      `\n🚨 There was an error at /api/spotify/callback: ${err} 🚨\n`
    )
    res.send(err.data)
  }
})

const spotifyAuthUrl = 'https://accounts.spotify.com/'

const getSpotifyToken = (props = {}) =>
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
  const { data, value, expires } = keys
  return axios({
    method: 'post',
    url: `${process.env.CLIENT_URL}/api/spotify/data/${key}${
      value ? `?value=${value}` : ''
    }${expires ? `&expires=${expires}` : ''}`,
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

async function getAccessToken() {
  const { data } = await axios.get(
    `${process.env.CLIENT_URL}/api/spotify/data/access_token`
  )
  const accessTokenObj = { value: data.access_token }
  if (!Boolean(accessTokenObj.value)) {
    const refeshToken = await axios.get(
      `${process.env.CLIENT_URL}/api/spotify/data/refresh_token`
    )
    const { refresh_token } = refeshToken.data
    const tokenData = await getSpotifyToken({
      refresh_token,
      grant_type: 'refresh_token'
    })
    Object.assign(accessTokenObj, {
      value: tokenData.data.tokenData,
      expires: tokenData.data.expires_in
    })
    postToRedis('access_token', accessTokenObj)
  }
  return accessTokenObj.value
}

app.get('/spotify/now-playing/', async (req, res) => {
  try {
    const access_token = await getAccessToken()
    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/currently-playing?market=US',
      {
        headers: {
          withCredentials: true,
          Authorization: `Bearer ${access_token}`
        }
      }
    )
    setLastPlayed(access_token, response.data)
    res.send(response.data)
  } catch (err) {
    res.send({ error: err.message })
  }
})

async function setLastPlayed(access_token, { item }) {
  if (!Boolean(item)) {
    const { data } = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played?market=US',
      {
        headers: {
          withCredentials: true,
          Authorization: `Bearer ${access_token}`
        }
      }
    )
    postStoredTrack(data.items[0])
  } else {
    postStoredTrack(item)
  }
}

function postStoredTrack({ name, artists, album }) {
  postToRedis('last_played', {
    data: { name, artists, image: album.images[0].url }
  })
}

module.exports = {
  path: '/api/',
  handler: app
}
