'use strict';

const winston = require('winston');
const config = require('../app');

/*
    We setup the logger this way to have one constant logger
    shared by all requesters, but have the log prefix updated per
    `require`.
*/
const logger = winston.createLogger({
    level: config.logging.minimum,
    format: winston.format.combine(
        winston.format.timestamp({
            'format': config.logging.datePattern
        }),
        winston.format((info) => {
            info.level = `[${info.level.toUpperCase()}]`.padEnd(7, ' ');
            return info;
        })(),
        winston.format.colorize(),
        winston.format.printf((info) => {
            const basePattern = `${info.level} [${info.timestamp}] [${info.prefix}] ${info.message}`;
            if (info.metadata) {
                return basePattern + ` [META] ${JSON.stringify(info.metadata)}`;
            }
            return basePattern;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

logger.emitErrs = false;

/**
 * Convert the given error object to JSON object that can be displayed.
 *
 * @param {Error} err Error object.
 * @return {JSON} JSON formatted error
 */
function _errorToJson(err) {
    const errorJson = {
        'msg': err.message,
        'file': err.fileName,
        'line': err.lineNumber,
        'name': err.name
    };
    return errorJson;
}

module.exports = function (logPrefix) {
    return {
        error: function (msg, metadata) {
            if (metadata instanceof Error) {
                logger.error(msg, {
                    'prefix': logPrefix,
                    'metadata': _errorToJson(metadata)
                });
                logger.error(metadata.stack, {
                    'prefix': logPrefix
                });
            } else {
                logger.error(msg, {
                    'prefix': logPrefix,
                    'metadata': metadata
                });
            }
        },
        warn: function (msg, metadata) {
            if (metadata instanceof Error) {
                logger.warn(msg, {
                    'prefix': logPrefix,
                    'metadata': _errorToJson(metadata)
                });
                logger.warn(metadata.stack, {
                    'prefix': logPrefix
                });
            } else {
                logger.warn(msg, {
                    'prefix': logPrefix,
                    'metadata': metadata
                });
            }
        },
        info: function (msg, metadata) {
            logger.info(msg, {
                'prefix': logPrefix,
                'metadata': metadata
            });
        },
        debug: function (msg, metadata) {
            logger.debug(msg, {
                'prefix': logPrefix,
                'metadata': metadata
            });
        },
        root: function () {
            return logger;
        }
    };
};
