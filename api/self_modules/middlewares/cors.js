var whitelist = (process.env.CORS_WHITELIST || 'http://localhost:8080,http://localhost:3000,http://localhost:3001').split(',')

module.exports = corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || origin === undefined) {
      let corsOption = {origin: true}
      callback(null, corsOption)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}