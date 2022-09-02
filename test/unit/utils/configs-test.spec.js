/*global describe, it*/
import * as assert from 'assert';
import * as chai from 'chai';
import {getConfigs} from "../../../src/utils/configs.js";

let expect = chai.expect;

describe('unit Tests', function() {
    it('getConfigShould pass', function () {
        const configs = getConfigs();
        expect(configs.port).to.eql('5000');
        expect(configs.authKey.length).to.eql(24);
        expect(configs.mysql.port).to.eql('3306');
        expect(configs.mysql.user.length).to.gt(0);
        expect(configs.mysql.password.length).to.gt(0);
        expect(configs.mysql.host.length).to.gt(0);
        expect(configs.mysql.database.length).to.gt(0);

    });

});
