import {setUpMySQL} from '@aicore/libtestutils';
import { v4 as uuidv4 } from 'uuid';

let config = null;


config = {
    'host': '192.168.68.102',
    'port': '3306',
    'user': 'cocouser',
    'password': 'toRSOmeORMEnt2@'

};

async function _init() {
    if (!config) {
        config = await setUpMySQL();
    }

    process.env.MY_SQL_SERVER = config.host;
    process.env.MY_SQL_SERVER_PORT = config.port;
    process.env.MY_SQL_USER = config.user;
    process.env.MY_SQL_PASSWORD = config.password;
    console.log(`${JSON.stringify(config)}`);

}

export async function getMySqlConfigs() {
    await _init();
    return config;
}

export async function getConfigs() {

    return {
        "port": "5000",
        "authKey": uuidv4(),
        "mysql": await getMySqlConfigs()
    };

}
