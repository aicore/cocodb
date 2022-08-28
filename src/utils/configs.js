import * as crypto from "crypto";
import {getMySqlConfigs} from "@aicore/libcommonutils";


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
    const port = process.env.COCO_DB_PORT || '5000';
    const authKey = process.env.COCO_DB_AUTH_KEY || crypto.randomBytes(4).toString('hex');
    //const mySqlConfigs = getMySqlConfigs();
    const mySqlConfigs = {
        'host': 'localhost',
        'port': '3306',
        'database': 'testdb',
        'user': 'root',
        'password': '1234'

    };
    return {
        port: port,
        authKey: authKey,
        mySqlConfigs: mySqlConfigs
    };
}
