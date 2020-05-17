'use strict';

const express = require('express');
const helmet = require('helmet');
const ejs = require('ejs');
const bodyparser = require('body-parser');

const appconfig = require('./conf/app');
const logger = require('./conf/logger')('appserv');

const EMPTY_CONTEXT_PATH = '/';

/**
 * [[ BLACKWATER VIVARIUMS WEB-SERVER ]]
 * 
 * 
 * @author njewsbury
 * @since 2019-12-22
 */
class WebServer {

    /**
     * Basic Constructor; Validates all required app config.
     */
    constructor() {
        if (!appconfig) {
            throw new Error('Unable to read application config object.');
        }

        if (!appconfig.port) {
            throw new Error(
                `Unable to locate required app config. `
                + `[CONFIG] port`
            );
        }

        if (!appconfig.path || !appconfig.path.context) {
            throw new Error(
                `Unable to locate required app config. `
                + `[CONFIG] path.context`
            );
        }

        if (!appconfig.path || !appconfig.path.public || !appconfig.path.protected || !appconfig.path.resources) {
            throw new Error(
                `Unable to locate required app config. `
                + `[CONFIG] path.public | path.protected | path.resources`
            );
        }

        if (!appconfig.pages || !appconfig.pages.welcome || !appconfig.pages.login) {
            throw new Error(
                `Unable to locate required app config. `
                + `[CONFIG] pages.welcome | pages.login`
            );
        }

        this.app = null;
        this.server = null;
        this.sessionStorage = null;
    }

    /**
     * Async Function to start the server.
     * 
     * This function will first validate all required config + connections before listening
     * on the desired app port.
     * 
     * @return {Promise<Void>} Promise that resolves once the server is listening, or rejects on fail.
     */
    run() {
        logger.info('Server startup requested...');
        return Promise.resolve().then(() => {
            return this._validateConnections();
        }).then(() => {
            return this._initializeExpress();
        }).then(() => {
            return this._initializeRoutes();
        }).then(() => {
            return this._listen();
        });
    }

    /**
     * Validate all required connections.
     * 
     * This helps prevent the server from starting in the event it can't connect to external
     * services. (ex Databases, Authentication)
     * 
     * @return {Promise<Void>} Promise that resolves once all connections are validated.
     */
    _validateConnections() {
        return new Promise((resolve, reject) => {
            logger.debug('Validating Connections...');
            return resolve();
        });
    }

    /**
     * Initialize the Express Server and required properties.
     * 
     * Attach required expressJs plugins, parsers, and renderers. This function will
     * not attach routes/listeners.
     * 
     * @return {Promise<Void>} Promise that resolves once express JS is initialized.
     */
    _initializeExpress() {
        return new Promise((resolve, reject) => {
            logger.debug('Initializing ExpressJS...');
            //
            this.app = express();
            this.app.disable('x-powered-by');
            this.app.set('view engine', 'ejs');
            this.app.engine('html', ejs.renderFile);

            this.app.use(bodyparser.json({
                extended: false
            }));
            this.app.use(bodyparser.urlencoded({
                extended: false
            }));
            this.app.use(helmet());

            // TODO: Session storage with AWS.
            // TODO: Passport initialize (if required)

            return resolve();
        });
    }

    /**
     * Initialize the server available routes (endpoints).
     * 
     * This function defines all the server endpoints and the method used for each.
     * It may also include a series of routers for specific paths.
     * 
     * @return {Promise<Void>} Promise that resolves once the server routes are setup.
     */
    _initializeRoutes() {
        return new Promise((resolve, reject) => {
            logger.debug('Initialize server routes...');

            let publicPath = appconfig.path.public;
            let protectedPath = appconfig.path.protected;

            let loginPage = publicPath + appconfig.pages.login;
            let welcomePage = protectedPath + appconfig.pages.welcome;

            if (appconfig.path.context !== EMPTY_CONTEXT_PATH) {
                publicPath = appconfig.path.context + publicPath;
                protectedPath = appconfig.path.context + protectedPath;

                loginPage = appconfig.path.context + loginPage;
                welcomePage = appconfig.path.context + welcomePage;
            }

            // PUBLIC RESOURCES
            this.app.use(publicPath, require('./routes/public'));
            // PROTECTED RESOURCES
            this.app.use(
                protectedPath,
                (req, res, next) => {
                    // ENSURE THE USER IS AUTHENTICATED
                    if (!req.isAuthenticated || !req.isAuthenticated()) {
                        if (req.session) {
                            const attemptedAccess = req.originalUrl || req.url;
                            if (attemptedAccess && attemptedAccess.includes('html')) {
                                // Only allow the return to address to be an html file.
                                req.session.returnTo = attemptedAccess;
                            }
                        }
                        return res.redirect(loginPage);
                    }
                    next();
                },
                require('./routes/protected')
            );

            // SETUP WELCOME FILE
            this.app.get(appconfig.path.context, (req, res) => {
                return res.redirect(welcomePage);
            });

            // REDIRECT FROM / TO /CONTEXT (if Context is not /)
            if (appconfig.path.context !== EMPTY_CONTEXT_PATH) {
                this.app.get(EMPTY_CONTEXT_PATH, (req, res) => {
                    return res.redirect(appconfig.path.context);
                });
            }

            return resolve();
        });
    }

    /**
     * Finalize initializing express and create the web server listener.
     * 
     * @return {Promise<Void>} Promise that resolves once the webserver is listening.
     */
    _listen() {
        return new Promise((resolve, reject) => {
            logger.debug('Starting webserver listener...');

            // TODO: HTTPS.
            this.server = this.app.listen(appconfig.port, () => {
                logger.info(
                    `Webserver listening for requests. `
                    + `[PORT] ${appconfig.port} `
                    + `[PATH] ${appconfig.path.context} `
                );
                return resolve(true);
            }).on('error', (err) => {
                return reject(err);
            });
        });
    }

    /**
     * Graceful Shutdown Function.
     * 
     * Close all external connections before turning off the server.
     * 
     * @return {Promise<Void>} Promise resolves once graceful shutdown complete.
     */
    shutdown() {
        return new Promise((resolve, reject) => {
            logger.info('Server shutdown requested...');
            return resolve();
        });
    }
}

if (appconfig.runtime === 'cluster') {
    // Primarily for AWS runtimes.
    const cluster = require('cluster');

    if (cluster.isMaster) {
        const cpuCount = require('os').cpus().length;

        for (let i = 0; i < cpuCount; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker) => {
            logger.warn(`A worker thread has died. Starting a new worker. [WORKER] ${worker.id}`);
            cluster.fork();
        });
    }
}

// Standard runtime (also cluster workers drop into this)
const webserver = new WebServer();
webserver.run().then(() => {
    logger.info('Webserver started.');
}).catch((err) => {
    logger.error('Unable to start webserver.', err);
    process.exit(1);
});

process.on('SIGINT', () => {
    logger.warn('SIGINT received. Initiating graceful shutdown.');
    webserver.shutdown().then(() => {
        logger.info('Webserver stopped.');
        process.exit(0);
    }).catch((err) => {
        logger.warn('Error during webserver shutdown', err);
        process.exit(1);
    });
});
