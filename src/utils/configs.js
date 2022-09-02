import * as fs from "fs";

let APP_CONFIG = null;

/**
 * It returns an object with the port, authKey, and mySqlConfigs
 * @returns An object with the following properties:
 *     port: The port number for the database server default port is 5000. override default port value using
 *     environment variable COCO_DB_PORT
 *
 *     authKey: A random string used to authenticate the client. this value can also be given using environment variable
 *     COCO_DB_AUTH_KEY
 *
 *     mySqlConfigs: An object with the following properties:
 *         host: The value of the environment variable MY_SQL_SERVER or 'localhost'
 *
 *         port: The value of the environment variable MY_SQL_SERVER_PORT or '3306'
 *
 *         database: The value of the environment variable MY_SQL_SERVER_DB or a random hex string
 *
 *         user: The value of the environment variable MY_SQL_USER or a random hex string
 *
 *         password :  The value of the environment variable MY_SQL_PASSWORD or a random hex string
 */
export function getConfigs() {
    if (APP_CONFIG) {
        return APP_CONFIG;
    }
    if (!process.env.APP_CONFIG) {
        throw new Error('Please provide valid app config file');
    }
    APP_CONFIG = _getAppConfig(process.env.APP_CONFIG);
    APP_CONFIG.port = APP_CONFIG.port || '5000';
    return APP_CONFIG;
}

function _getAppConfig(file) {
    const appConfigFile = fs.readFileSync(file);
    const appConfig = JSON.parse(appConfigFile.toString());
    return appConfig;
}

