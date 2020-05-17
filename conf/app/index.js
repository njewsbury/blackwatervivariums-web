'use strict';
require('dotenv').config();

/**
 * APP CONFIGURATION.
 * 
 * Reads environment variables and creates an aggregate config object. All environment variables
 * are received as strings and must be parsed to get non-strings.
 * 
 * @author njewsbury
 * @since 2020-05-16
 */
module.exports = {
    'port': process.env.PORT,
    'runtime': process.env.RUNTIME || 'standard',
    'path': {
        'context': process.env.PATH_CONTEXT || '/',
        'public': process.env.PATH_PUBLIC || '/public',
        'protected': process.env.PATH_PROTECTED || '/view',
        'resources': process.env.PATH_RESOURCES || '/resource'
    },
    'pages': {
        'welcome': process.env.PAGES_WELCOME || '/index.html',
        'login': process.env.PAGES_LOGIN || '/login.html'
    },
    'logging': {
        'minimum': process.env.LOGGING_MINIMUM || 'INFO',
        'datePattern': process.env.LOGGING_DATEPATTERN || 'MM-DDTHH:mm:ss'
    }
};
