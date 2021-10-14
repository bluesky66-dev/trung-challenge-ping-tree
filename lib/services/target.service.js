const redis = require('../redis/index')
module.exports = {
  saveTarget,
  getTargetById,
  getTargetCallback,
  getTargets
}
// Save Target promise
function saveTarget (id, body) {
  return new Promise((resolve, reject) => {
    redis.saveTarget(id, body, (err) => {
      if (err) reject(err)
      resolve(body)
    })
  })
}

// Get Target by id
function getTargetById (id) {
  return new Promise((resolve, reject) => {
    redis.getTargetById(id, (_err, data) => {
      if (data) resolve(JSON.parse(data))
      resolve(null)
    })
  })
}

// Get Targets by id return callback
function getTargetCallback (id, cb) {
  redis.getTargetById(id, (_err, data) => {
    if (data) cb(JSON.parse(data))
    cb(null)
  })
}
// Get all Targets
function getTargets () {
  return new Promise((resolve, reject) => {
    redis.getTargets((err, data) => {
      if (err) {
        return reject(new Error('Failed to fetch'))
      }
      if (data) {
        const sendData = data.map(item => {
          return JSON.parse(item)
        })
        resolve(sendData)
      }
      resolve([])
    })
  })
}
