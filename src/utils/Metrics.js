/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2021 - present core.ai . All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see https://opensource.org/licenses/AGPL-3.0.
 *
 */

import * as CoreMetrics from '@aicore/metrics';

let isProduction = false;

/**
 * Initialize metrics with production-only emission
 * @param {string} serviceName - Service identifier
 * @param {string} stage - Environment stage (dev/prod)
 * @param {string} endpoint - Metrics collection endpoint
 * @param {string} apiKey - API key for metrics service
 */
export function init(serviceName, stage, endpoint, apiKey) {
    const normalizedStage = stage?.toLowerCase() || 'development';
    isProduction = normalizedStage !== 'dev' && normalizedStage !== 'development';

    if (isProduction) {
        CoreMetrics.init(serviceName, stage, endpoint, apiKey);
    }
}

/**
 * Count a metrics event (production only)
 * @param {string} category - Metrics category
 * @param {string} subCategory - Metrics subcategory
 * @param {string} label - Metrics label
 * @param {number} count - Count value (default: 1)
 */
export function countEvent(category, subCategory, label, count = 1) {
    if (isProduction) {
        CoreMetrics.countEvent(category, subCategory, label, count);
    }
}

/**
 * Record a value event (production only)
 * @param {string} category - Metrics category
 * @param {string} subCategory - Metrics subcategory
 * @param {string} label - Metrics label
 * @param {number} value - Value to record
 */
export function valueEvent(category, subCategory, label, value) {
    if (isProduction) {
        CoreMetrics.valueEvent(category, subCategory, label, value);
    }
}

/**
 * Flush pending metrics (production only)
 * @returns {Promise} Resolves when flush is complete
 */
export function flush() {
    if (isProduction) {
        return CoreMetrics.flush();
    }
    return Promise.resolve();
}
