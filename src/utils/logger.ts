import { createLogger, format, transports } from 'winston'
const { colorize, timestamp, printf, combine } = format

const isProd = process.env.NODE_ENV === 'prod'

export const logger = createLogger({
  level: isProd ? 'info' : 'debug',
  defaultMeta: {
    name: process.env.SERVICE_NAME,
  },
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss:SSS',
    }),
    format((info) =>
      Object.assign(info, { level: info.level.toUpperCase() })
    )(),
    colorize({
      all: true,
    }),
    printf(({ timestamp, level, message }) => {
      return `${timestamp} - [${level}] - ${message}`
    })
  ),
  transports: isProd
    ? [
        new transports.Console(),
        new transports.File({
          filename: './logs/log.log',
          level: 'info',
        }),
        new transports.File({
          filename: './logs/errors.log',
          level: 'error',
        }),
      ]
    : [new transports.Console()],
})
