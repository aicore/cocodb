import {ecsFormat} from '@elastic/ecs-pino-format';
import {getStage} from './configs.js';

/**
 * Creates a Fastify logger configuration based on the stage
 * - Development: Pretty formatted, colorized logs
 * - Production/Staging: ECS JSON format for Elasticsearch
 * @returns {object} Fastify logger configuration
 */
export function createFastifyLogger() {
    // This sets NODE_ENV internally based on app.json stage
    getStage();

    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
        // Pretty logs for development
        return {
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss',
                    ignore: 'pid,hostname',
                    singleLine: false
                }
            }
        };
    }

    // ECS format for production/staging
    return ecsFormat({
        convertReqRes: true  // Converts req/res to ECS HTTP fields
    });
}
