import {createFastifyLogger} from '../../../src/utils/logger.js';
import {deleteAppConfig} from '../../../src/utils/configs.js';
import {strict as assert} from 'assert';
import fs from 'fs';

describe('Logger Configuration Tests', () => {
    const TEST_CONFIG_DEV = process.cwd() + '/test-config-dev.json';
    const TEST_CONFIG_PROD = process.cwd() + '/test-config-prod.json';

    beforeEach(() => {
        // Clean state before each test
        deleteAppConfig(); // Clear cached config
        delete process.env.APP_CONFIG;
        delete process.env.NODE_ENV;
        // Clean up any existing test config files
        if (fs.existsSync(TEST_CONFIG_DEV)) {
            fs.unlinkSync(TEST_CONFIG_DEV);
        }
        if (fs.existsSync(TEST_CONFIG_PROD)) {
            fs.unlinkSync(TEST_CONFIG_PROD);
        }
    });

    afterEach(() => {
        // Clean up test config files
        if (fs.existsSync(TEST_CONFIG_DEV)) {
            fs.unlinkSync(TEST_CONFIG_DEV);
        }
        if (fs.existsSync(TEST_CONFIG_PROD)) {
            fs.unlinkSync(TEST_CONFIG_PROD);
        }
        deleteAppConfig(); // Clear cached config
        delete process.env.APP_CONFIG;
        delete process.env.NODE_ENV;
    });

    it('should create pretty logger for dev stage', () => {
        // Create dev config
        const devConfig = {
            stage: 'dev',
            port: '5000',
            authKey: 'test-key',
            mysql: {host: 'localhost', port: '3306', user: 'test', password: 'test'}
        };
        fs.writeFileSync(TEST_CONFIG_DEV, JSON.stringify(devConfig));
        process.env.APP_CONFIG = TEST_CONFIG_DEV;

        const loggerConfig = createFastifyLogger();

        // Verify it returns pino-pretty configuration
        assert.ok(loggerConfig.transport, 'Should have transport config for dev');
        assert.equal(loggerConfig.transport.target, 'pino-pretty', 'Should use pino-pretty');
        assert.ok(loggerConfig.transport.options, 'Should have pino-pretty options');
        assert.equal(loggerConfig.transport.options.colorize, true, 'Should colorize logs');
    });

    it('should create ECS logger for prod stage', () => {
        // Create prod config
        const prodConfig = {
            stage: 'prod',
            port: '5000',
            authKey: 'test-key',
            mysql: {host: 'localhost', port: '3306', user: 'test', password: 'test'}
        };
        fs.writeFileSync(TEST_CONFIG_PROD, JSON.stringify(prodConfig));
        process.env.APP_CONFIG = TEST_CONFIG_PROD;

        const loggerConfig = createFastifyLogger();

        // Verify it returns ECS format configuration (object without transport = ECS)
        assert.equal(typeof loggerConfig, 'object', 'Should return ECS formatter object for prod');
        assert.equal(loggerConfig.transport, undefined, 'Should not have transport (uses ECS format)');
    });

    it('should create ECS logger for production stage', () => {
        // Create production config
        const prodConfig = {
            stage: 'production',
            port: '5000',
            authKey: 'test-key',
            mysql: {host: 'localhost', port: '3306', user: 'test', password: 'test'}
        };
        fs.writeFileSync(TEST_CONFIG_PROD, JSON.stringify(prodConfig));
        process.env.APP_CONFIG = TEST_CONFIG_PROD;

        const loggerConfig = createFastifyLogger();

        // Verify it returns ECS format configuration
        assert.equal(typeof loggerConfig, 'object', 'Should return ECS formatter object for production');
        assert.equal(loggerConfig.transport, undefined, 'Should not have transport (uses ECS format)');
    });

    it('should default to dev logger when config missing', () => {
        // Don't create any config file
        delete process.env.APP_CONFIG;

        const loggerConfig = createFastifyLogger();

        // Should default to development (pretty) when config doesn't exist
        assert.ok(loggerConfig.transport, 'Should have transport config when defaulting to dev');
        assert.equal(loggerConfig.transport.target, 'pino-pretty', 'Should default to pino-pretty');
    });

    it('should create dev logger for development stage', () => {
        // Create development config
        const devConfig = {
            stage: 'development',
            port: '5000',
            authKey: 'test-key',
            mysql: {host: 'localhost', port: '3306', user: 'test', password: 'test'}
        };
        fs.writeFileSync(TEST_CONFIG_DEV, JSON.stringify(devConfig));
        process.env.APP_CONFIG = TEST_CONFIG_DEV;

        const loggerConfig = createFastifyLogger();

        // Verify pretty logger for development
        assert.ok(loggerConfig.transport, 'Should have transport config for development');
        assert.equal(loggerConfig.transport.target, 'pino-pretty', 'Should use pino-pretty for development');
    });
});
