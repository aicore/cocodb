/*global describe, it*/
import * as assert from 'assert';
import * as chai from 'chai';
import * as fs from 'fs';
import {deleteAppConfig, getConfigs} from "../../../src/utils/configs.js";

let expect = chai.expect;

describe('unit Tests', function () {

    it('verify config fail if APP_CONFIG not set properly', function () {
        const backEnv = process.env.APP_CONFIG;
        const appJsonPath = './src/app.json';
        const appJsonBackup = './src/app.json.backup';

        // Temporarily move src/app.json if it exists
        let appJsonExisted = false;
        if (fs.existsSync(appJsonPath)) {
            fs.renameSync(appJsonPath, appJsonBackup);
            appJsonExisted = true;
        }

        delete process.env.APP_CONFIG;
        deleteAppConfig();
        let exceptionOccurred = false;
        try {
            getConfigs();
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid app config file by setting APP_CONFIG ' +
                'environment variable or providing valid app.json in src folder');
            exceptionOccurred = true;
        }
        expect(exceptionOccurred).eql(true);

        // Restore
        process.env.APP_CONFIG = backEnv;
        if (appJsonExisted) {
            fs.renameSync(appJsonBackup, appJsonPath);
        }
        deleteAppConfig(); // Clear cached config to allow next test to read from correct file

    });
    it('getConfigShould pass', function () {
        let configs = getConfigs();
        _verifyConfigs(configs);
        configs = getConfigs();
        // call verify config second time
        _verifyConfigs(configs);

    });
    it('default port should be 5000', function () {
        let configs = getConfigs();
        _verifyConfigs(configs);
        configs = getConfigs();
        // call verify config second time
        _verifyConfigs(configs);
    });
});

function _verifyConfigs(configs) {
    expect(configs.port).to.eql('5000');
    expect(configs.authKey.length).to.eql(24);
    expect(configs.mysql.port).to.eql('3306');
    expect(configs.mysql.user.length).to.gt(0);
    expect(configs.mysql.password.length).to.gt(0);
    expect(configs.mysql.host.length).to.gt(0);
    expect(configs.mysql.database.length).to.gt(0);

}
