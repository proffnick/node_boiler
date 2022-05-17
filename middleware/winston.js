const {transports, createLogger, format} = require('winston');

module.exports = createLogger({
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    defaultMeta: { service: 'user-service'},
    transports: [
      new transports.Console({colorize: true, prettyPrint: true}),
      new transports.File({ filename: 'logfile.log', level: 'error'}),
      new transports.File({ filename: 'user.log', level: 'info'})
    ],
    exitOnError: true
  });