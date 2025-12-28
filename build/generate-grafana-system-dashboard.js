#!/usr/bin/env node

/**
 * Generates Grafana dashboard JSON for system metrics monitoring
 * Outputs to dashboards/grafana-system.json
 *
 * Metrics API: valueEvent(category, subCategory, label, value)
 *
 * Tracks SYSTEM metrics with field mapping:
 * - category: 'system' (constant)
 * - subcategory: resource type ('cpu', 'memory', 'event_loop', 'process', 'os', 'disk')
 * - label: specific metric name (e.g., 'load_avg_1m', 'rss_mb', 'mean_delay_ms')
 * - value: metric value
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration from grafana-config.json
const configPath = path.join(__dirname, 'grafana-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const { serviceName, stage: STAGE, dashboardNamePrefix } = config;

// System metrics definitions organized by subcategory
const METRIC_DEFINITIONS = {
    cpu: {
        displayName: 'CPU',
        metrics: [
            { label: 'load_avg_1m', displayName: 'load_avg_1m', unit: 'none' },
            { label: 'load_avg_5m', displayName: 'load_avg_5m', unit: 'none' },
            { label: 'load_avg_15m', displayName: 'load_avg_15m', unit: 'none' },
            { label: 'core_count', displayName: 'core_count', unit: 'none' },
            { label: 'total_user_percent', displayName: 'total_user_percent', unit: 'percent' },
            { label: 'total_sys_percent', displayName: 'total_sys_percent', unit: 'percent' },
            { label: 'total_idle_percent', displayName: 'total_idle_percent', unit: 'percent' }
        ]
    },
    memory: {
        displayName: 'MEMORY',
        metrics: [
            { label: 'rss_mb', displayName: 'rss_mb', unit: 'mbytes' },
            { label: 'heap_total_mb', displayName: 'heap_total_mb', unit: 'mbytes' },
            { label: 'heap_used_mb', displayName: 'heap_used_mb', unit: 'mbytes' },
            { label: 'external_mb', displayName: 'external_mb', unit: 'mbytes' },
            { label: 'array_buffers_mb', displayName: 'array_buffers_mb', unit: 'mbytes' },
            { label: 'total_mb', displayName: 'total_mb', unit: 'mbytes' },
            { label: 'free_mb', displayName: 'free_mb', unit: 'mbytes' },
            { label: 'used_mb', displayName: 'used_mb', unit: 'mbytes' },
            { label: 'usage_percent', displayName: 'usage_percent', unit: 'percent' },
            { label: 'free_percent', displayName: 'free_percent', unit: 'percent' }
        ]
    },
    event_loop: {
        displayName: 'EVENT_LOOP',
        metrics: [
            { label: 'mean_delay_ms', displayName: 'mean_delay_ms', unit: 'ms' },
            { label: 'max_delay_ms', displayName: 'max_delay_ms', unit: 'ms' },
            { label: 'min_delay_ms', displayName: 'min_delay_ms', unit: 'ms' }
        ]
    },
    process: {
        displayName: 'PROCESS',
        metrics: [
            { label: 'uptime_seconds', displayName: 'uptime_seconds', unit: 's' },
            { label: 'uptime_days', displayName: 'uptime_days', unit: 's' },
            { label: 'active_handles', displayName: 'active_handles', unit: 'none' },
            { label: 'active_requests', displayName: 'active_requests', unit: 'none' },
            { label: 'file_descriptors_open', displayName: 'file_descriptors_open', unit: 'none' },
            { label: 'file_descriptors_max', displayName: 'file_descriptors_max', unit: 'none' }
        ]
    },
    os: {
        displayName: 'OS',
        metrics: [
            { label: 'uptime_hours', displayName: 'uptime_hours', unit: 'none' }
        ]
    },
    disk: {
        displayName: 'DISK',
        metrics: [
            { label: 'total_mb', displayName: 'total_mb', unit: 'mbytes' },
            { label: 'used_mb', displayName: 'used_mb', unit: 'mbytes' },
            { label: 'available_mb', displayName: 'available_mb', unit: 'mbytes' },
            { label: 'usage_percent', displayName: 'usage_percent', unit: 'percent' },
            { label: 'free_pct', displayName: 'free_pct', unit: 'percent' },
            { label: 'inode_usage_percent', displayName: 'inode_usage_percent', unit: 'percent' }
        ]
    }
};

// Panel ID counter
let panelId = 1;

/**
 * Creates a time series panel for a system metric
 */
function createTimeSeriesPanel(subcategory, metric, x, y, w, h) {
    const { label, displayName, unit } = metric;
    const subcategoryUpper = METRIC_DEFINITIONS[subcategory].displayName;
    const title = `${subcategoryUpper} - ${displayName}`;

    return {
        datasource: {
            type: 'questdb-questdb-datasource',
            uid: 'feymgm249rv9cb'
        },
        fieldConfig: {
            defaults: {
                color: {
                    mode: 'palette-classic'
                },
                custom: {
                    axisBorderShow: false,
                    axisCenteredZero: false,
                    axisColorMode: 'text',
                    axisLabel: '',
                    axisPlacement: 'auto',
                    barAlignment: 0,
                    barWidthFactor: 0.6,
                    drawStyle: 'line',
                    fillOpacity: 0,
                    gradientMode: 'none',
                    hideFrom: {
                        legend: false,
                        tooltip: false,
                        viz: false
                    },
                    insertNulls: false,
                    lineInterpolation: 'linear',
                    lineWidth: 1,
                    pointSize: 5,
                    scaleDistribution: {
                        type: 'linear'
                    },
                    showPoints: 'auto',
                    spanNulls: false,
                    stacking: {
                        group: 'A',
                        mode: 'none'
                    },
                    thresholdsStyle: {
                        mode: 'off'
                    }
                },
                mappings: [],
                thresholds: {
                    mode: 'absolute',
                    steps: [
                        {
                            color: 'green',
                            value: 0
                        },
                        {
                            color: 'red',
                            value: 80
                        }
                    ]
                },
                unit
            },
            overrides: []
        },
        gridPos: { h, w, x, y },
        id: panelId++,
        options: {
            legend: {
                calcs: [],
                displayMode: 'list',
                placement: 'bottom',
                showLegend: true
            },
            tooltip: {
                hideZeros: false,
                mode: 'single',
                sort: 'none'
            }
        },
        pluginVersion: '12.1.1',
        targets: [
            {
                datasource: {
                    type: 'questdb-questdb-datasource',
                    uid: 'feymgm249rv9cb'
                },
                format: 0,
                meta: {
                    builderOptions: {
                        fields: [],
                        limit: '',
                        mode: 'list',
                        timeField: ''
                    }
                },
                queryType: 'sql',
                rawSql: `SELECT
  timestamp AS "time",
  value AS ${label}
FROM metrics
WHERE service = '${serviceName}'
  AND stage = '${STAGE}'
  AND category = 'system'
  AND subcategory = '${subcategory}'
  AND label = '${label}'
  AND $__timeFilter(timestamp)
ORDER BY "time";`,
                refId: 'A',
                selectedFormat: 2
            }
        ],
        title,
        type: 'timeseries'
    };
}

/**
 * Creates a stat panel with sparkline for overview metrics
 */
function createStatPanel(title, subcategory, label, unit, x, y, w, h, thresholds = null, calc = 'lastNotNull') {
    const defaultThresholds = {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'red', value: 80 }
        ]
    };

    return {
        datasource: {
            type: 'questdb-questdb-datasource',
            uid: 'feymgm249rv9cb'
        },
        fieldConfig: {
            defaults: {
                color: {
                    mode: 'thresholds'
                },
                mappings: [],
                thresholds: thresholds || defaultThresholds,
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
                calcs: [calc]
            },
            showPercentChange: false,
            textMode: 'auto',
            wideLayout: true
        },
        pluginVersion: '12.1.1',
        targets: [
            {
                datasource: {
                    type: 'questdb-questdb-datasource',
                    uid: 'feymgm249rv9cb'
                },
                format: 0,
                queryType: 'sql',
                rawSql: `SELECT
  timestamp AS "time",
  value AS ${label}
FROM metrics
WHERE service = '${serviceName}'
  AND stage = '${STAGE}'
  AND category = 'system'
  AND subcategory = '${subcategory}'
  AND label = '${label}'
  AND $__timeFilter(timestamp)
ORDER BY "time";`,
                refId: 'A',
                selectedFormat: 2
            }
        ],
        title,
        type: 'stat'
    };
}

/**
 * Creates a stat panel with multiple metrics displayed
 */
function createMultiMetricStatPanel(title, subcategory, metrics, x, y, w, h, thresholds = null, calc = 'lastNotNull', customOverrides = []) {
    const defaultThresholds = {
        mode: 'absolute',
        steps: [
            { color: 'green', value: null },
            { color: 'red', value: 80 }
        ]
    };

    const targets = metrics.map((metric, index) => ({
        datasource: {
            type: 'questdb-questdb-datasource',
            uid: 'feymgm249rv9cb'
        },
        format: 0,
        queryType: 'sql',
        rawSql: `SELECT
  timestamp AS "time",
  value AS ${metric.label}
FROM metrics
WHERE service = '${serviceName}'
  AND stage = '${STAGE}'
  AND category = 'system'
  AND subcategory = '${subcategory}'
  AND label = '${metric.label}'
  AND $__timeFilter(timestamp)
ORDER BY "time";`,
        refId: String.fromCharCode(65 + index), // 'A', 'B', 'C', etc.
        selectedFormat: 2
    }));

    const baseOverrides = metrics.slice(1).map((metric, index) => ({
        matcher: {
            id: 'byName',
            options: metric.label
        },
        properties: [
            {
                id: 'unit',
                value: metric.unit
            },
            {
                id: 'displayName',
                value: metric.displayName
            }
        ]
    }));

    return {
        datasource: {
            type: 'questdb-questdb-datasource',
            uid: 'feymgm249rv9cb'
        },
        fieldConfig: {
            defaults: {
                color: {
                    mode: 'thresholds'
                },
                mappings: [],
                thresholds: thresholds || defaultThresholds,
                unit: metrics[0].unit
            },
            overrides: [...baseOverrides, ...customOverrides]
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
                calcs: [calc]
            },
            showPercentChange: false,
            textMode: 'value_and_name',
            wideLayout: true
        },
        pluginVersion: '12.1.1',
        targets,
        title,
        type: 'stat'
    };
}

/**
 * Creates a health score stat panel with custom SQL calculation
 */
function createHealthScorePanel(title, rawSql, unit, x, y, w, h, thresholds, calc = 'mean') {
    return {
        datasource: {
            type: 'questdb-questdb-datasource',
            uid: 'feymgm249rv9cb'
        },
        fieldConfig: {
            defaults: {
                color: {
                    mode: 'thresholds'
                },
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
                calcs: [calc]
            },
            showPercentChange: false,
            textMode: 'auto',
            wideLayout: true
        },
        pluginVersion: '12.1.1',
        targets: [
            {
                datasource: {
                    type: 'questdb-questdb-datasource',
                    uid: 'feymgm249rv9cb'
                },
                format: 0,
                queryType: 'sql',
                rawSql,
                refId: 'A',
                selectedFormat: 2
            }
        ],
        title,
        type: 'stat'
    };
}

/**
 * Creates a collapsible row panel
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
 * Generates the complete dashboard JSON
 */
function generateDashboard() {
    const panels = [];
    let currentY = 0;

    // ===========================================
    // OVERVIEW SECTION (Always Visible)
    // ===========================================

    // Row 1: Health Scores (3 columns, 8 units wide each)
    const healthScoresRow = createRow('System Health Overview', currentY, false);
    panels.push(healthScoresRow);
    currentY += 1;

    // Event Loop Health Score
    const eventLoopHealthSql = `SELECT
  timestamp AS "time",
  value AS event_loop_health
FROM metrics
WHERE service = '${serviceName}'
  AND stage = '${STAGE}'
  AND category = 'system'
  AND subcategory = 'event_loop'
  AND label = 'mean_delay_ms'
  AND $__timeFilter(timestamp)
ORDER BY "time";`;

    panels.push(createHealthScorePanel(
        'Event Loop Health',
        eventLoopHealthSql,
        'ms',
        0, currentY, 8, 6,
        {
            mode: 'absolute',
            steps: [
                { color: 'green', value: null },
                { color: 'yellow', value: 25 },
                { color: 'orange', value: 60 },
                { color: 'red', value: 100 }
            ]
        },
        'mean' // Use mean for event loop delay
    ));

    // CPU Saturation Score (Load / Cores) with core count
    panels.push(createMultiMetricStatPanel(
        'CPU Saturation',
        'cpu',
        [
            { label: 'load_avg_1m', displayName: 'Load (1m)', unit: 'none' },
            { label: 'core_count', displayName: 'Cores', unit: 'none' }
        ],
        8, currentY, 8, 6,
        {
            mode: 'absolute',
            steps: [
                { color: 'green', value: null },
                { color: 'yellow', value: 0.7 },
                { color: 'red', value: 1.0 }
            ]
        },
        'mean', // Use mean for load average
        [
            // Override for load_avg_1m to round to 2 decimal places
            {
                matcher: {
                    id: 'byName',
                    options: 'load_avg_1m'
                },
                properties: [
                    {
                        id: 'decimals',
                        value: 2
                    }
                ]
            },
            // Override for core_count to make it green
            {
                matcher: {
                    id: 'byName',
                    options: 'core_count'
                },
                properties: [
                    {
                        id: 'color',
                        value: {
                            mode: 'fixed',
                            fixedColor: 'green'
                        }
                    }
                ]
            }
        ]
    ));

    // Memory Pressure (Combined metric)
    const memoryPressureSql = `SELECT
  timestamp AS "time",
  value AS memory_pressure
FROM metrics
WHERE service = '${serviceName}'
  AND stage = '${STAGE}'
  AND category = 'system'
  AND subcategory = 'memory'
  AND label = 'usage_percent'
  AND $__timeFilter(timestamp)
ORDER BY "time";`;

    panels.push(createHealthScorePanel(
        'Memory Pressure',
        memoryPressureSql,
        'percent',
        16, currentY, 8, 6,
        {
            mode: 'absolute',
            steps: [
                { color: 'green', value: null },
                { color: 'yellow', value: 70 },
                { color: 'red', value: 85 }
            ]
        },
        'mean' // Use mean for memory usage percentage
    ));
    currentY += 6;

    // Row 2: Key Metrics (3 columns, 8 units wide each)
    panels.push(createStatPanel(
        'CPU Usage %',
        'cpu',
        'total_user_percent',
        'percent',
        0, currentY, 8, 6,
        {
            mode: 'absolute',
            steps: [
                { color: 'green', value: null },
                { color: 'yellow', value: 70 },
                { color: 'red', value: 85 }
            ]
        },
        'mean' // Use mean for CPU usage percentage
    ));

    panels.push(createMultiMetricStatPanel(
        'Memory Usage',
        'memory',
        [
            { label: 'usage_percent', displayName: 'Usage %', unit: 'percent' },
            { label: 'used_mb', displayName: 'Used', unit: 'mbytes' },
            { label: 'total_mb', displayName: 'Total', unit: 'mbytes' }
        ],
        8, currentY, 8, 6,
        {
            mode: 'absolute',
            steps: [
                { color: 'green', value: null },
                { color: 'yellow', value: 70 },
                { color: 'red', value: 85 }
            ]
        },
        'mean', // Use mean for memory metrics
        [
            // Make used_mb and total_mb green
            {
                matcher: {
                    id: 'byName',
                    options: 'used_mb'
                },
                properties: [
                    {
                        id: 'color',
                        value: {
                            mode: 'fixed',
                            fixedColor: 'green'
                        }
                    }
                ]
            },
            {
                matcher: {
                    id: 'byName',
                    options: 'total_mb'
                },
                properties: [
                    {
                        id: 'color',
                        value: {
                            mode: 'fixed',
                            fixedColor: 'green'
                        }
                    }
                ]
            }
        ]
    ));

    panels.push(createMultiMetricStatPanel(
        'Disk Usage',
        'disk',
        [
            { label: 'usage_percent', displayName: 'Usage %', unit: 'percent' },
            { label: 'used_mb', displayName: 'Used', unit: 'mbytes' },
            { label: 'total_mb', displayName: 'Total', unit: 'mbytes' }
        ],
        16, currentY, 8, 6,
        {
            mode: 'absolute',
            steps: [
                { color: 'green', value: null },
                { color: 'yellow', value: 70 },
                { color: 'red', value: 85 }
            ]
        },
        'mean', // Use mean for disk metrics
        [
            // Make used_mb and total_mb green
            {
                matcher: {
                    id: 'byName',
                    options: 'used_mb'
                },
                properties: [
                    {
                        id: 'color',
                        value: {
                            mode: 'fixed',
                            fixedColor: 'green'
                        }
                    }
                ]
            },
            {
                matcher: {
                    id: 'byName',
                    options: 'total_mb'
                },
                properties: [
                    {
                        id: 'color',
                        value: {
                            mode: 'fixed',
                            fixedColor: 'green'
                        }
                    }
                ]
            }
        ]
    ));
    currentY += 6;

    // Row 3: Process Uptime and Stability (2 columns + space)
    panels.push(createStatPanel(
        'App Uptime (Days)',
        'process',
        'uptime_days',
        'd',
        0, currentY, 12, 4,
        {
            mode: 'absolute',
            steps: [
                { color: 'green', value: null }
            ]
        },
        'lastNotNull' // Use last value for uptime
    ));

    // Count restarts by detecting when uptime drops
    const restartCountSql = `SELECT
  timestamp AS "time",
  1 AS restart_count
FROM (
  SELECT
    timestamp,
    value,
    LAG(value) OVER (ORDER BY timestamp) AS prev_value
  FROM metrics
  WHERE service = '${serviceName}'
    AND stage = '${STAGE}'
    AND category = 'system'
    AND subcategory = 'process'
    AND label = 'uptime_seconds'
    AND $__timeFilter(timestamp)
)
WHERE value < prev_value
ORDER BY timestamp;`;

    panels.push(createHealthScorePanel(
        'App Restarts',
        restartCountSql,
        'short',
        12, currentY, 12, 4,
        {
            mode: 'absolute',
            steps: [
                { color: 'green', value: null },
                { color: 'yellow', value: 1 },
                { color: 'red', value: 3 }
            ]
        },
        'sum' // Sum to count total restarts
    ));
    currentY += 4;

    // ===========================================
    // DETAILED SECTIONS (Collapsible, 3-column)
    // ===========================================

    // CPU Details
    const cpuRow = createRow('CPU Details', currentY, true);
    panels.push(cpuRow);
    currentY += 1;

    const cpuPanels = [];
    for (let i = 0; i < METRIC_DEFINITIONS.cpu.metrics.length; i++) {
        const metric = METRIC_DEFINITIONS.cpu.metrics[i];
        const column = i % 3; // 3 columns
        const x = column * 8; // 0, 8, 16
        const w = 8;
        const h = 8;
        const rowOffset = Math.floor(i / 3) * h;

        cpuPanels.push(createTimeSeriesPanel('cpu', metric, x, rowOffset, w, h));
    }

    // Memory Details
    const memoryRow = createRow('Memory Details', currentY, true);
    panels.push(memoryRow);
    currentY += 1;

    const memoryPanels = [];
    for (let i = 0; i < METRIC_DEFINITIONS.memory.metrics.length; i++) {
        const metric = METRIC_DEFINITIONS.memory.metrics[i];
        const column = i % 3;
        const x = column * 8;
        const w = 8;
        const h = 8;
        const rowOffset = Math.floor(i / 3) * h;

        memoryPanels.push(createTimeSeriesPanel('memory', metric, x, rowOffset, w, h));
    }

    // Disk Details
    const diskRow = createRow('Disk Details', currentY, true);
    panels.push(diskRow);
    currentY += 1;

    const diskPanels = [];
    for (let i = 0; i < METRIC_DEFINITIONS.disk.metrics.length; i++) {
        const metric = METRIC_DEFINITIONS.disk.metrics[i];
        const column = i % 3;
        const x = column * 8;
        const w = 8;
        const h = 8;
        const rowOffset = Math.floor(i / 3) * h;

        diskPanels.push(createTimeSeriesPanel('disk', metric, x, rowOffset, w, h));
    }

    // Event Loop Details
    const eventLoopRow = createRow('Event Loop Details', currentY, true);
    panels.push(eventLoopRow);
    currentY += 1;

    const eventLoopPanels = [];
    for (let i = 0; i < METRIC_DEFINITIONS.event_loop.metrics.length; i++) {
        const metric = METRIC_DEFINITIONS.event_loop.metrics[i];
        const column = i % 3;
        const x = column * 8;
        const w = 8;
        const h = 8;
        const rowOffset = Math.floor(i / 3) * h;

        eventLoopPanels.push(createTimeSeriesPanel('event_loop', metric, x, rowOffset, w, h));
    }

    // Process Details
    const processRow = createRow('Process Details', currentY, true);
    panels.push(processRow);
    currentY += 1;

    const processPanels = [];
    for (let i = 0; i < METRIC_DEFINITIONS.process.metrics.length; i++) {
        const metric = METRIC_DEFINITIONS.process.metrics[i];
        const column = i % 3;
        const x = column * 8;
        const w = 8;
        const h = 8;
        const rowOffset = Math.floor(i / 3) * h;

        processPanels.push(createTimeSeriesPanel('process', metric, x, rowOffset, w, h));
    }

    // OS Details
    const osRow = createRow('OS Details', currentY, true);
    panels.push(osRow);
    currentY += 1;

    const osPanels = [];
    for (let i = 0; i < METRIC_DEFINITIONS.os.metrics.length; i++) {
        const metric = METRIC_DEFINITIONS.os.metrics[i];
        const x = 0;
        const w = 24; // Full width for single panel
        const h = 8;
        const rowOffset = Math.floor(i / 3) * h;

        osPanels.push(createTimeSeriesPanel('os', metric, x, rowOffset, w, h));
    }

    // Add collapsed panels to their respective rows
    cpuRow.panels = cpuPanels;
    memoryRow.panels = memoryPanels;
    diskRow.panels = diskPanels;
    eventLoopRow.panels = eventLoopPanels;
    processRow.panels = processPanels;
    osRow.panels = osPanels;

    const dashboard = {
        annotations: {
            list: [
                {
                    builtIn: 1,
                    datasource: {
                        type: 'grafana',
                        uid: '-- Grafana --'
                    },
                    enable: true,
                    hide: true,
                    iconColor: 'rgba(0, 211, 255, 1)',
                    name: 'Annotations & Alerts',
                    type: 'dashboard'
                }
            ]
        },
        editable: true,
        fiscalYearStartMonth: 0,
        graphTooltip: 0,
        id: null,
        links: [],
        panels,
        preload: false,
        schemaVersion: 41,
        tags: ['questdb', 'system', 'cpu'],
        templating: {
            list: [
                {
                    current: {
                        text: ['All'],
                        value: ['$__all']
                    },
                    datasource: {
                        type: 'questdb-questdb-datasource',
                        uid: 'feymgm249rv9cb'
                    },
                    definition: `SELECT DISTINCT label FROM metrics WHERE service='${serviceName}'`,
                    includeAll: true,
                    multi: true,
                    name: 'label',
                    options: [],
                    query: `SELECT DISTINCT label FROM metrics WHERE service='${serviceName}'`,
                    refresh: 1,
                    sort: 1,
                    type: 'query'
                }
            ]
        },
        time: {
            from: 'now-6h',
            to: 'now'
        },
        timepicker: {},
        timezone: 'browser',
        title: `${dashboardNamePrefix} - System`,
        uid: `${serviceName}-system`,
        version: 3
    };

    return dashboard;
}

/**
 * Main execution
 */
function main() {
    console.log('Generating Grafana System Metrics Dashboard...');

    const dashboard = generateDashboard();

    // Ensure dashboards directory exists
    const dashboardsDir = path.join(__dirname, '..', 'dashboards-generated');
    if (!fs.existsSync(dashboardsDir)) {
        fs.mkdirSync(dashboardsDir, { recursive: true });
    }

    // Write dashboard JSON
    const outputPath = path.join(dashboardsDir, 'grafana-system.json');
    fs.writeFileSync(outputPath, JSON.stringify(dashboard, null, 2));

    // Calculate statistics
    let totalMetrics = 0;
    for (const definition of Object.values(METRIC_DEFINITIONS)) {
        totalMetrics += definition.metrics.length;
    }

    console.log(`✓ Dashboard generated successfully: ${outputPath}`);
    console.log(`  - Total panels: ${panelId - 1}`);
    console.log(`  - Subcategories: ${Object.keys(METRIC_DEFINITIONS).length}`);
    console.log(`  - Total metrics: ${totalMetrics}`);
    console.log(`  - Layout: 2 columns, ${12}x${8} per panel`);
    console.log('\nMetrics breakdown:');
    for (const [subcategory, definition] of Object.entries(METRIC_DEFINITIONS)) {
        console.log(`  - ${definition.displayName}: ${definition.metrics.length} metrics`);
    }
}

main();
