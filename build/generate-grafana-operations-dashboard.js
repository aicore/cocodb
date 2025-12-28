#!/usr/bin/env node

/**
 * Generates Grafana dashboard JSON for operational error metrics monitoring
 * Outputs to dashboards-generated/grafana-operations.json
 *
 * Tracks operational error metrics with field mapping:
 * - category: 'WEBSOCKET' or 'REQUEST'
 * - subcategory: operation name (e.g., 'getFromNonIndex', 'put')
 * - label: 'error'
 * - value: error count
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
const configPath = path.join(__dirname, 'grafana-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const { serviceName, stage: STAGE, dashboardNamePrefix } = config;

// Panel ID counter
let panelId = 1;

/**
 * Creates a time series panel
 */
function createTimeSeriesPanel(title, rawSql, x, y, w, h, legendPlacement = 'bottom', unit = 'short') {
    return {
        datasource: {
            type: 'questdb-questdb-datasource',
            uid: 'feymgm249rv9cb'
        },
        fieldConfig: {
            defaults: {
                color: { mode: 'palette-classic' },
                custom: {
                    axisBorderShow: false,
                    axisCenteredZero: false,
                    axisColorMode: 'text',
                    axisLabel: '',
                    axisPlacement: 'auto',
                    barAlignment: 0,
                    barWidthFactor: 0.6,
                    drawStyle: 'line',
                    fillOpacity: 10,
                    gradientMode: 'none',
                    hideFrom: { legend: false, tooltip: false, viz: false },
                    insertNulls: false,
                    lineInterpolation: 'linear',
                    lineWidth: 2,
                    pointSize: 5,
                    scaleDistribution: { type: 'linear' },
                    showPoints: 'never',
                    spanNulls: false,
                    stacking: { group: 'A', mode: 'none' },
                    thresholdsStyle: { mode: 'off' }
                },
                mappings: [],
                thresholds: {
                    mode: 'absolute',
                    steps: [{ color: 'green', value: null }]
                },
                unit
            },
            overrides: []
        },
        gridPos: { h, w, x, y },
        id: panelId++,
        options: {
            legend: {
                calcs: ['mean', 'last'],
                displayMode: 'table',
                placement: legendPlacement,
                showLegend: true
            },
            tooltip: { mode: 'multi', sort: 'desc' }
        },
        pluginVersion: '12.1.1',
        targets: [{
            datasource: {
                type: 'questdb-questdb-datasource',
                uid: 'feymgm249rv9cb'
            },
            format: 0,
            queryType: 'sql',
            rawSql,
            refId: 'A',
            selectedFormat: 2
        }],
        title,
        type: 'timeseries'
    };
}

/**
 * Creates a stat panel
 */
function createStatPanel(title, rawSql, unit, x, y, w, h, thresholds) {
    return {
        datasource: {
            type: 'questdb-questdb-datasource',
            uid: 'feymgm249rv9cb'
        },
        fieldConfig: {
            defaults: {
                color: { mode: 'thresholds' },
                mappings: [],
                thresholds,
                unit
            },
            overrides: []
        },
        gridPos: { h, w, x, y },
        id: panelId++,
        options: {
            graphMode: 'area',
            colorMode: 'value',
            justifyMode: 'auto',
            orientation: 'auto',
            reduceOptions: {
                values: false,
                fields: '',
                calcs: ['lastNotNull']
            },
            showPercentChange: false,
            textMode: 'auto',
            wideLayout: true
        },
        pluginVersion: '12.1.1',
        targets: [{
            datasource: {
                type: 'questdb-questdb-datasource',
                uid: 'feymgm249rv9cb'
            },
            format: 0,
            queryType: 'sql',
            rawSql,
            refId: 'A',
            selectedFormat: 2
        }],
        title,
        type: 'stat'
    };
}

/**
 * Creates a bar chart panel
 */
function createBarChartPanel(title, rawSql, x, y, w, h, unit = 'short') {
    return {
        datasource: {
            type: 'questdb-questdb-datasource',
            uid: 'feymgm249rv9cb'
        },
        fieldConfig: {
            defaults: {
                color: { mode: 'palette-classic' },
                custom: {
                    axisBorderShow: false,
                    axisCenteredZero: false,
                    axisColorMode: 'text',
                    axisLabel: '',
                    axisPlacement: 'auto',
                    fillOpacity: 80,
                    gradientMode: 'none',
                    hideFrom: { legend: false, tooltip: false, viz: false },
                    lineWidth: 1,
                    scaleDistribution: { type: 'linear' },
                    thresholdsStyle: { mode: 'off' }
                },
                mappings: [],
                thresholds: {
                    mode: 'absolute',
                    steps: [{ color: 'green', value: null }]
                },
                unit
            },
            overrides: []
        },
        gridPos: { h, w, x, y },
        id: panelId++,
        options: {
            barRadius: 0,
            barWidth: 0.97,
            fullHighlight: false,
            groupWidth: 0.7,
            legend: {
                calcs: [],
                displayMode: 'list',
                placement: 'bottom',
                showLegend: true
            },
            orientation: 'auto',
            showValue: 'auto',
            stacking: 'none',
            tooltip: { mode: 'single', sort: 'none' },
            xTickLabelRotation: 0,
            xTickLabelSpacing: 0
        },
        pluginVersion: '12.1.1',
        targets: [{
            datasource: {
                type: 'questdb-questdb-datasource',
                uid: 'feymgm249rv9cb'
            },
            format: 0,
            queryType: 'sql',
            rawSql,
            refId: 'A',
            selectedFormat: 2
        }],
        title,
        type: 'barchart'
    };
}

/**
 * Creates a collapsible row
 */
function createRow(title, y, collapsed = false) {
    return {
        type: 'row',
        title,
        collapsed,
        gridPos: { h: 1, w: 24, x: 0, y },
        id: panelId++,
        panels: []
    };
}

/**
 * Generates health overview panels (compact top row)
 * Returns array of 4 stat panels (no row header)
 */
function generateHealthOverviewPanels() {
    const panels = [];
    const y = 0;

    // Total Errors (all categories)
    const totalErrorsSql = `SELECT SUM(value) AS total_errors FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND label = 'error' AND $__timeFilter(timestamp);`;

    panels.push(createStatPanel('Total Errors', totalErrorsSql, 'short', 0, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'yellow', value: 1 },
            { color: 'orange', value: 10 },
            { color: 'red', value: 50 }
        ]
    }));

    // Auth Failures
    const authFailuresSql = `SELECT SUM(value) AS auth_failures FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'AUTH' AND label = 'failure' AND $__timeFilter(timestamp);`;

    panels.push(createStatPanel('Auth Failures', authFailuresSql, 'short', 6, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'yellow', value: 1 },
            { color: 'orange', value: 10 },
            { color: 'red', value: 50 }
        ]
    }));

    // Requests/min
    const requestsSql = `SELECT timestamp AS "time", SUM(value) AS requests FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'WEBSOCKET' AND label IN ('success', 'failure') AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time";`;

    panels.push(createStatPanel('Requests/min', requestsSql, 'reqpm', 12, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null }
        ]
    }));

    // P99 Latency
    const p99Sql = `SELECT approx_percentile(value, 0.99) AS p99_latency FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'value' AND category = 'WEBSOCKET' AND label = 'latency_ms' AND $__timeFilter(timestamp);`;

    panels.push(createStatPanel('P99 Latency', p99Sql, 'ms', 18, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'yellow', value: 100 },
            { color: 'orange', value: 500 },
            { color: 'red', value: 1000 }
        ]
    }));

    return panels;
}

/**
 * Generates error monitoring panels
 * Returns array of 9 panels (1 row + 4 stats + 2 time series + 2 bar charts)
 */
function generateErrorPanels() {
    const panels = [];
    let y = 0;

    // Row separator (collapsible)
    panels.push(createRow('Operational Errors', y, false));
    y += 1;

    // Error stat panels (4 in a row)
    const totalErrorsSql = `SELECT timestamp AS "time", SUM(value) AS total_errors FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND label = 'error' AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time";`;

    panels.push(createStatPanel('Total Errors', totalErrorsSql, 'short', 0, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'yellow', value: 1 },
            { color: 'orange', value: 10 },
            { color: 'red', value: 50 }
        ]
    }));

    const wsErrorsSql = `SELECT timestamp AS "time", SUM(value) AS ws_errors FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'WEBSOCKET' AND label = 'error' AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time";`;

    panels.push(createStatPanel('WebSocket Errors', wsErrorsSql, 'short', 6, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'yellow', value: 1 },
            { color: 'orange', value: 10 },
            { color: 'red', value: 50 }
        ]
    }));

    const httpErrorsSql = `SELECT timestamp AS "time", SUM(value) AS http_errors FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'REQUEST' AND label = 'error' AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time";`;

    panels.push(createStatPanel('HTTP Errors', httpErrorsSql, 'short', 12, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'yellow', value: 1 },
            { color: 'orange', value: 10 },
            { color: 'red', value: 50 }
        ]
    }));

    const errorRateSql = `SELECT timestamp AS "time", SUM(value) AS error_rate FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND label = 'error' AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time";`;

    panels.push(createStatPanel('Error Rate (per min)', errorRateSql, 'cpm', 18, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'yellow', value: 0.5 },
            { color: 'orange', value: 2 },
            { color: 'red', value: 10 }
        ]
    }));
    y += 4;

    // Error trends (2 wide time series)
    const errorTrendsSql = `SELECT timestamp AS "time", subcategory AS operation, SUM(value) AS errors FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'WEBSOCKET' AND label = 'error' AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time", operation;`;

    panels.push(createTimeSeriesPanel('WebSocket Errors by Operation', errorTrendsSql, 0, y, 12, 8, 'right', 'short'));

    const httpErrorTrendsSql = `SELECT timestamp AS "time", subcategory AS endpoint, SUM(value) AS errors FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'REQUEST' AND label = 'error' AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time", endpoint;`;

    panels.push(createTimeSeriesPanel('HTTP Errors by Endpoint', httpErrorTrendsSql, 12, y, 12, 8, 'right', 'short'));
    y += 8;

    // Top failures (2 bar charts)
    const topWsErrorsSql = `SELECT subcategory AS operation, SUM(value) AS error_count FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'WEBSOCKET' AND label = 'error' AND $__timeFilter(timestamp) ORDER BY error_count DESC LIMIT 10;`;

    panels.push(createBarChartPanel('Top WebSocket Operations (by errors)', topWsErrorsSql, 0, y, 12, 8, 'short'));

    const topHttpErrorsSql = `SELECT subcategory AS endpoint, SUM(value) AS error_count FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'REQUEST' AND label = 'error' AND $__timeFilter(timestamp) ORDER BY error_count DESC LIMIT 10;`;

    panels.push(createBarChartPanel('Top HTTP Endpoints (by errors)', topHttpErrorsSql, 12, y, 12, 8, 'short'));

    return panels;
}

/**
 * Generates WebSocket latency visualization panels
 * Returns array with 2 collapsed rows containing nested panels
 */
function generateLatencyPanels() {
    const results = [];

    // === WebSocket Latency Row ===
    const latencyChildPanels = [];
    let y = 1;

    // Time series - latency metrics including percentiles and average
    const latencyMetricsSql = `SELECT timestamp AS "time", approx_percentile(value, 0.50) AS "P50", approx_percentile(value, 0.95) AS "P95", approx_percentile(value, 0.99) AS "P99", AVG(value) AS "Average" FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'value' AND category = 'WEBSOCKET' AND label = 'latency_ms' AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time";`;

    latencyChildPanels.push(createTimeSeriesPanel('Latency Percentiles Over Time', latencyMetricsSql, 0, y, 24, 8, 'right', 'ms'));
    y += 8;

    // Bar chart - slowest operations
    const slowestOpsSql = `SELECT subcategory AS operation, AVG(value) AS avg_latency_ms FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'value' AND category = 'WEBSOCKET' AND label = 'latency_ms' AND $__timeFilter(timestamp) ORDER BY avg_latency_ms DESC LIMIT 10;`;

    latencyChildPanels.push(createBarChartPanel('Slowest Operations (by avg latency)', slowestOpsSql, 0, y, 24, 8, 'ms'));

    const latencyRow = createRow('WebSocket Latency', 0, true);
    latencyRow.panels = latencyChildPanels;
    results.push(latencyRow);

    // === Per-Endpoint Latency Details Row ===
    const endpointChildPanels = [];
    y = 1;

    const operations = [
        'get', 'put', 'update', 'query',
        'createDb', 'deleteDb', 'createTable', 'deleteTable',
        'createIndex', 'deleteDocument', 'deleteDocuments',
        'getFromIndex', 'getFromNonIndex', 'mathAdd', 'hello'
    ];

    for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        const x = (i % 2) * 12;

        const sql = `SELECT timestamp AS "time", approx_percentile(value, 0.50) AS "P50", approx_percentile(value, 0.95) AS "P95", approx_percentile(value, 0.99) AS "P99", AVG(value) AS "Average" FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'value' AND category = 'WEBSOCKET' AND subcategory = '${operation}' AND label = 'latency_ms' AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time";`;

        endpointChildPanels.push(createTimeSeriesPanel(`${operation} Latency`, sql, x, y, 12, 10, 'bottom', 'ms'));

        if (i % 2 === 1) y += 10;
    }

    const endpointRow = createRow('Per-Endpoint Latency Details', 0, true);
    endpointRow.panels = endpointChildPanels;
    results.push(endpointRow);

    return results;
}

/**
 * Generates WebSocket operations throughput visualization panels
 * Returns array with 2 collapsed rows containing nested panels
 */
function generateThroughputPanels() {
    const results = [];

    // === WebSocket Operations Throughput Row ===
    const throughputChildPanels = [];
    let y = 1;

    // Stat panels (4 in a row)
    const totalRequestsSql = `SELECT timestamp AS "time", SUM(value) AS total_requests FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'WEBSOCKET' AND label IN ('success', 'failure') AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time";`;

    throughputChildPanels.push(createStatPanel('Requests/min', totalRequestsSql, 'reqpm', 0, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'yellow', value: 100 },
            { color: 'orange', value: 500 },
            { color: 'red', value: 1000 }
        ]
    }));

    const successCountSql = `SELECT SUM(CASE WHEN label = 'success' THEN value ELSE 0 END) AS success_count FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'WEBSOCKET' AND label IN ('success', 'failure') AND $__timeFilter(timestamp);`;

    throughputChildPanels.push(createStatPanel('Success Count', successCountSql, 'short', 6, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null }
        ]
    }));

    const failureCountSql = `SELECT SUM(CASE WHEN label = 'failure' THEN value ELSE 0 END) AS failure_count FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'WEBSOCKET' AND label IN ('success', 'failure') AND $__timeFilter(timestamp);`;

    throughputChildPanels.push(createStatPanel('Failure Count', failureCountSql, 'short', 12, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'yellow', value: 10 },
            { color: 'orange', value: 100 },
            { color: 'red', value: 500 }
        ]
    }));

    const totalCountSql = `SELECT SUM(value) AS total FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'WEBSOCKET' AND label IN ('success', 'failure') AND $__timeFilter(timestamp);`;

    throughputChildPanels.push(createStatPanel('Total Requests', totalCountSql, 'short', 18, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'blue', value: null }
        ]
    }));
    y += 4;

    // Time series - requests over time
    const requestsTrendSql = `SELECT timestamp AS "time", SUM(value) AS requests_per_min FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'WEBSOCKET' AND label IN ('success', 'failure') AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time";`;

    throughputChildPanels.push(createTimeSeriesPanel('Requests Per Minute Over Time', requestsTrendSql, 0, y, 24, 8, 'right', 'reqpm'));
    y += 8;

    // Bar chart - most active operations
    const mostActiveOpsSql = `SELECT subcategory AS operation, SUM(value) AS total_requests FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'WEBSOCKET' AND label IN ('success', 'failure') AND $__timeFilter(timestamp) GROUP BY operation ORDER BY total_requests DESC LIMIT 10;`;

    throughputChildPanels.push(createBarChartPanel('Most Active Operations', mostActiveOpsSql, 0, y, 24, 8, 'short'));

    const throughputRow = createRow('WebSocket Operations Throughput', 0, true);
    throughputRow.panels = throughputChildPanels;
    results.push(throughputRow);

    // === Per-Endpoint Throughput Details Row ===
    const endpointChildPanels = [];
    y = 1;

    const operations = [
        'get', 'put', 'update', 'query',
        'createDb', 'deleteDb', 'createTable', 'deleteTable',
        'createIndex', 'deleteDocument', 'deleteDocuments',
        'getFromIndex', 'getFromNonIndex', 'mathAdd', 'hello'
    ];

    for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        const x = (i % 2) * 12;

        const sql = `SELECT timestamp AS "time", SUM(value) AS requests_per_min FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'WEBSOCKET' AND subcategory = '${operation}' AND label IN ('success', 'failure') AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time";`;

        endpointChildPanels.push(createTimeSeriesPanel(`${operation} Requests/min`, sql, x, y, 12, 10, 'bottom', 'reqpm'));

        if (i % 2 === 1) y += 10;
    }

    const endpointRow = createRow('Per-Endpoint Throughput Details', 0, true);
    endpointRow.panels = endpointChildPanels;
    results.push(endpointRow);

    return results;
}

/**
 * Generates authentication metrics panels
 * Returns array with row containing nested panels (for collapsed state)
 */
function generateAuthPanels() {
    let y = 1;  // Start after row

    const childPanels = [];

    // Auth success count
    const authSuccessSql = `SELECT SUM(value) AS success_count FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'AUTH' AND label = 'success' AND $__timeFilter(timestamp);`;

    childPanels.push(createStatPanel('Auth Success', authSuccessSql, 'short', 0, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null }
        ]
    }));

    // Auth failure count
    const authFailureSql = `SELECT SUM(value) AS failure_count FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'AUTH' AND label = 'failure' AND $__timeFilter(timestamp);`;

    childPanels.push(createStatPanel('Auth Failures', authFailureSql, 'short', 6, y, 6, 4, {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'yellow', value: 1 },
            { color: 'orange', value: 10 },
            { color: 'red', value: 50 }
        ]
    }));
    y += 4;

    // Auth failures over time
    const authFailuresTrendSql = `SELECT timestamp AS "time", SUM(value) AS auth_failures FROM metrics WHERE service = '${serviceName}' AND stage = '${STAGE}' AND metric_type = 'count' AND category = 'AUTH' AND label = 'failure' AND $__timeFilter(timestamp) SAMPLE BY 1m ORDER BY "time";`;

    childPanels.push(createTimeSeriesPanel('Auth Failures Over Time', authFailuresTrendSql, 0, y, 24, 8, 'right', 'short'));

    // Create row with nested panels for collapsed state
    const row = createRow('Authentication', 0, true);
    row.panels = childPanels;

    return [row];
}

/**
 * Generates complete dashboard from scratch
 * Order: Health Overview → Errors → Auth → Throughput → Latency
 */
function generateFullDashboard() {
    const panels = [];
    let y = 0;

    const HEALTH_OVERVIEW_HEIGHT = 4;
    const ERROR_SECTION_HEIGHT = 21;
    const COLLAPSED_ROW_HEIGHT = 1;  // Collapsed rows only take 1 unit

    // Health Overview (compact stats at top)
    const healthPanels = generateHealthOverviewPanels();
    for (const panel of healthPanels) {
        panel.gridPos.y += y;
        panels.push(panel);
    }
    y += HEALTH_OVERVIEW_HEIGHT;

    // Error section (most critical, expanded)
    const errorPanels = generateErrorPanels();
    for (const panel of errorPanels) {
        panel.gridPos.y += y;
        panels.push(panel);
    }
    y += ERROR_SECTION_HEIGHT;

    // Auth section (collapsed row with nested panels)
    const authRows = generateAuthPanels();
    for (const row of authRows) {
        row.gridPos.y = y;
        panels.push(row);
        y += COLLAPSED_ROW_HEIGHT;
    }

    // Throughput section (collapsed rows with nested panels)
    const throughputRows = generateThroughputPanels();
    for (const row of throughputRows) {
        row.gridPos.y = y;
        panels.push(row);
        y += COLLAPSED_ROW_HEIGHT;
    }

    // Latency section (collapsed rows with nested panels)
    const latencyRows = generateLatencyPanels();
    for (const row of latencyRows) {
        row.gridPos.y = y;
        panels.push(row);
        y += COLLAPSED_ROW_HEIGHT;
    }

    // Assign sequential panel IDs (including nested panels)
    let panelId = 1;
    for (const panel of panels) {
        panel.id = panelId++;
        if (panel.panels && panel.panels.length > 0) {
            for (const nestedPanel of panel.panels) {
                nestedPanel.id = panelId++;
            }
        }
    }

    return {
        title: `${dashboardNamePrefix} - Operations`,
        uid: 'cocodb-operations',
        id: null,
        version: 1,
        schemaVersion: 41,
        editable: true,
        fiscalYearStartMonth: 0,
        graphTooltip: 1,
        timezone: 'browser',
        time: { from: 'now-6h', to: 'now' },
        timepicker: {},
        panels,
        links: [],
        tags: ['cocodb', 'operations', 'questdb'],
        annotations: { list: [] },
        templating: { list: [] }
    };
}

/**
 * Main execution
 */
function main() {
    console.log('Generating operations dashboard...');

    const dashboard = generateFullDashboard();

    // Ensure dashboards-generated directory exists
    const dashboardsDir = path.join(__dirname, '..', 'dashboards-generated');
    if (!fs.existsSync(dashboardsDir)) {
        fs.mkdirSync(dashboardsDir, { recursive: true });
    }

    const outputPath = path.join(dashboardsDir, 'grafana-operations.json');
    fs.writeFileSync(outputPath, JSON.stringify(dashboard, null, 2));

    console.log(`\n✓ Generated ${outputPath}`);
    console.log(`  - Total panels: ${dashboard.panels.length}`);
}

main();
