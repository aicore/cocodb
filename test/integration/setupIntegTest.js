import {setUpMySQL} from '@aicore/libtestutils';
import {v4 as uuidv4} from 'uuid';
import fs from "fs";
import {close, startDB} from "../../src/server.js";

let config = null;

export const CONFIG_FILE = process.cwd() + '/conf.json';
export const DATABASE_NAME = 'test';
export const TABLE_NAME = DATABASE_NAME + '.customers';
export let CONFIGS = null;
let isStarted = false;

const resolves = [];
/*
config = {
    'host': '192.168.68.102',
    'port': '3306',
    'user': 'cocouser',
    'password': 'toRSOmeORMEnt2@'

};
*/
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

export async function initTest() {
    if (isStarted){
        return;
    }
    CONFIGS = await getConfigs();
    fs.appendFileSync(CONFIG_FILE, JSON.stringify(CONFIGS));
    process.env.APP_CONFIG = CONFIG_FILE;
    startDB();
    setTimeout(function () {
        for (let resolve in resolves) {
            resolve();
        }
    }, 5000);
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(5000); /// waiting 1 second.

    isStarted = true;


}

export function isServerStarted() {
    return new Promise(resolve => {
        if (isStarted) {
            resolve();
            return;
        }
        resolves.push(resolve);
    });
}


let numberOfTestFiles = 2;

export async function cleanUp() {
    --numberOfTestFiles;
    if (numberOfTestFiles === 0) {
        close();
        fs.unlinkSync(CONFIG_FILE);
    }
}
