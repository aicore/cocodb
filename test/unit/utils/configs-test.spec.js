/*global describe, it*/
import * as assert from 'assert';
import * as chai from 'chai';
import {getConfigs} from "../../../src/utils/configs.js";

let expect = chai.expect;

describe('unit Tests', function() {
    it('getConfigShould pass', function () {
        const configs = getConfigs();
        expect(configs.port).to.eql('5000');
        expect(configs.authKey.length).to.eql(8);
        expect(configs.mySqlConfigs.port).to.eql('3306');
        expect(configs.mySqlConfigs.user.length).to.eql(9);
        expect(configs.mySqlConfigs.password.length).to.eql(9);
        expect(configs.mySqlConfigs.host.length).to.eql(9);
        expect(configs.mySqlConfigs.database.length).to.eql(9);

    });

});
