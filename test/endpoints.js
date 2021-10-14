process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')
var server = require('../lib/server')
const { getTargets } = require('../lib/services/target.service')
// Test healch check
test.serial.cb('healthcheck', function (t) {
  var url = '/health'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})
/**
 * Get Targets
 */
test.serial.cb('Get targets', function (t) {
  var url = '/api/targets'
  getTargets().then(dbData => {
    servertest(server(), url, { encoding: 'json' }, function (err, res) {
      t.falsy(err, 'no error')
      t.is(res.statusCode, 200, 'correct statusCode')
      t.deepEqual(res.body.data, dbData, 'status is ok')
      t.end()
    })
  })
})

/**
 * Test Get Target by Id
 */

test.serial.cb('should get values by id', function (t) {
  var postUrl = '/api/targets'
  var postOpts = { method: 'POST', encoding: 'json' }
  var getUrl = '/api/target'
  var getOpts = { method: 'GET', encoding: 'json' }
  const target = {
    url: 'http://targets.com',
    value: '0.50',
    maxAcceptsPerDay: '10',
    accept: {
      geoState: {
        $in: ['ca', 'ny']
      },
      hour: {
        $in: ['13', '14', '15']
      }
    }
  }

  servertest(server(), postUrl, postOpts, onResponse)
    .end(JSON.stringify(target))
  // test plan
  t.plan(2)

  // test
  function onResponse (_err, res) {
    t.is(res.statusCode, 200, 'correct statusCode')
    servertest(server(), `${getUrl}/${res.body.data.id}`, getOpts, (_err, resp) => {
      t.is(JSON.stringify(resp.body.data), JSON.stringify(resp.body.data), 'Correct Data')
      t.end()
    })
  }
})
/**
 * Test Post by id
 */
test.serial.cb('should post values', function (t) {
  var url = '/api/targets'
  var opts = { method: 'POST', encoding: 'json' }
  var getUrl = '/api/target'
  var getOpts = { method: 'GET', encoding: 'json' }
  const target = {
    url: 'http://target.org',
    value: '0.50',
    maxAcceptsPerDay: '10',
    accept: {
      geoState: {
        $in: ['ca', 'ny']
      },
      hour: {
        $in: ['13', '14', '15']
      }
    }
  }
  // test plan 3
  t.plan(3)
  // post target
  servertest(server(), url, opts, onResponse)
    .end(JSON.stringify(target))

  // post target callback function
  function onResponse (_err, res) {
    t.is(res.statusCode, 200, 'correct statusCode')
    servertest(server(), `${getUrl}/${res.body.data.id}`, getOpts, (_err, resp) => {
      t.is(resp.statusCode, 200, 'Status code passed')
      t.is(JSON.stringify(resp.body.data), JSON.stringify(resp.body.data), 'Correct Data')
      t.end()
    })
  }
})

// Test post with body
test.serial.cb('shouldnt post values', function (t) {
  var url = '/api/targets'
  var opts = { method: 'POST', encoding: 'json' }

  // test plan 3
  t.plan(1)
  // post target
  servertest(server(), url, opts, onResponse)
    .end()

  // post target callback function
  function onResponse (_err, res) {
    t.is(res.statusCode, 422, 'correct statusCode')
    t.end()
  }
})
/**
 * Test Update post
 */

test.serial.cb('should update by id', function (t) {
  const postUrl = '/api/targets'
  const opts = { method: 'POST', encoding: 'json' }
  const updateUrl = '/api/target'
  // create target body
  const target = {
    url: 'http://targets.com',
    value: '0.50',
    maxAcceptsPerDay: '10',
    accept: {
      geoState: {
        $in: ['ca', 'ny']
      },
      hour: {
        $in: ['13', '14', '15']
      }
    }
  }
  // update target body
  const target2 = {
    url: 'http://targets.com',
    value: '0.90',
    maxAcceptsPerDay: '10',
    accept: {
      geoState: {
        $in: ['ca', 'ny']
      },
      hour: {
        $in: ['13', '14', '15']
      }
    }
  }
  // plan for 3 assertion
  t.plan(3)

  // create target
  servertest(server(), postUrl, opts, onResponse)
    .end(JSON.stringify(target))

  function onResponse (_err, res) {
    // update target
    servertest(server(), `${updateUrl}/${res.body.data.id}`, opts, onUpdateResponse)
      .end(JSON.stringify(target2))

    function onUpdateResponse (_err, resp) {
      t.is(res.statusCode, 200, 'correct statusCode')
      t.is(target2.value, resp.body?.data.value)
      t.not(res.body.data.value, resp.body.data.value)
      t.end()
    }
  }
})

test.serial.cb('update target without invalid id', function (t) {
  const url = '/api/target'
  const opts = { method: 'POST', encoding: 'json' }
  const target = {
    url: 'http://targets.com',
    value: '0.90',
    maxAcceptsPerDay: '10',
    accept: {
      geoState: {
        $in: ['ca', 'ny']
      },
      hour: {
        $in: ['13', '14', '15']
      }
    }
  }

  // create target
  servertest(server(), url + '/123', opts, onResponse).end(JSON.stringify(target))
  t.plan(1)
  function onResponse (_err, res) {
    t.is(res.statusCode, 400, 'correct statusCode')
    t.end()
  }
})
/**
 * Test Route Decision API
 */
test.serial.cb('Route decision', function (t) {
  var url = '/route'
  var opts = { method: 'POST', encoding: 'json' }
  const postData = {
    geoState: 'ny',
    publisher: 'abc',
    timestamp: '2018-07-19T23:28:59.513Z'
  }

  t.plan(2)
  servertest(server(), url, opts, onResponse)
    .end(JSON.stringify(postData))

  function onResponse (_err, res) {
    t.truthy(!(res.body.data))
    t.is(res.statusCode, 200, 'correct statusCode')
    t.end()
  }
})

/**
 * Not Found Test
 */
test.serial.cb('not found', function (t) {
  var url = '/notfound'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.is(err, null, 'no error')

    t.is(res.statusCode, 404)
    t.is(res.body.error, 'Resource Not Found')
    t.end()
  })
})
