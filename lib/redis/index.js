const redis = require('../redis')

module.exports = {
  saveTarget: saveTarget,
  getTargets: getTargets,
  getTargetById: getTargetById,
  updateTarget: updateTarget,
  acceptsPerDaySave: acceptsPerDaySave
}

// Save target to redis
function saveTarget (id, data, cb) {
  redis.set(`target-${id}`, data, function (err) {
    if (err) return cb(err)
    return cb()
  })
}
// Get all saved targets
function getTargets (cb) {
  redis.keys('target-*', function (err, data) {
    if (err) return cb(err, null)
    if (data) {
      redis.mget(data, function (_err, data) {
        return cb(null, data)
      })
    } else {
      cb(null, [])
    }
  })
}
// Get targets by id
function getTargetById (id, cb) {
  redis.keys(`target-${id}`, function (err, data) {
    if (err) return cb(err, null)
    if (data) {
      redis.get(data, function (err, data) {
        if (err) return cb(err, null)
        return cb(null, data)
      })
    }
  })
}
// update target
function updateTarget (index, data, cb) {
  redis.set('target', index, data, function (err, data) {
    if (err) return cb(err, null)
    if (data) return cb(null, data)
  })
}

// get daily max accepts
function acceptsPerDaySave (id) {
  return new Promise((resolve, reject) => {
    redis.incr(`accepts-${id}`, function (err, data) {
      if (err) return reject(err)
      redis.expire(`accepts-${id}`, 86400, function (err, data) {
        if (err) return reject(err)
        return resolve(data || 0)
      })
    })
  })
}
