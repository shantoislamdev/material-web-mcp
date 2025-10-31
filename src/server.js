/**
 * Material Web MCP Server
 *
 * Copyright (c) 2025 Shanto Islam
 *
 * GitHub: https://github.com/shanroislamdev
 * Repository: https://github.com/shanroislamdev/material-web-mcp
 * License: https://github.com/shanroislamdev/material-web-mcp/blob/main/LICENSE
 *
 * Licensed under the MIT License.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import winston from 'winston';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Server start time for uptime tracking
const startTime = Date.now();

// Timeout utility
function withTimeout(promise, timeoutMs) {
    let timeoutId;
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
        })
    ]).finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
    });
}

// Cache for API extractions
let apiCache = new Map();

// Cached documentation files
let cachedDocFiles = null;

const docsDir = path.join(__dirname, '..', 'ui-docs');

// Reusable scan utility
async function scanDocsDir() {
    if (cachedDocFiles) return cachedDocFiles;
    const files = [];
    async function scan(dir) {
        try {
            const entries = await withTimeout(fs.readdir(dir, { withFileTypes: true }), 5000);
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await scan(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.md')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            logger.error(`Error scanning directory ${dir}:`, error);
            throw error;
        }
    }
    await scan(docsDir);
    cachedDocFiles = files;
    return files;
}

// Refresh cache function
async function refreshDocCache() {
    cachedDocFiles = null;
    await scanDocsDir();
}


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

logger.info('Server starting');

// Signal handlers for graceful shutdown
process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Process-level error handlers
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const server = new McpServer({
    name: 'material-web-mcp',
    version: '0.1.0',
});

// Register doc resources
async function registerDocResources() {
    const files = await scanDocsDir();
    for (const fullPath of files) {
        const relativePath = path.relative(docsDir, fullPath);
        const uri = `mcp://material-web/docs/${relativePath.replace(/\\/g, '/')}`;
        server.registerResource(
            relativePath.replace(/[/\\]/g, '-').replace(/\.md$/, ''),
            uri,
            {
                title: path.basename(relativePath, '.md'),
                description: `Documentation for ${path.basename(relativePath, '.md')}`,
                mimeType: 'text/markdown',
            },
            async (uri) => {
                try {
                    // Path validation
                    if (relativePath.includes('..')) {
                        throw new Error('Access denied: path traversal detected');
                    }
                    const content = await withTimeout(fs.readFile(fullPath, 'utf-8'), 5000);
                    return {
                        contents: [{
                            uri: uri.href,
                            mimeType: 'text/markdown',
                            text: content,
                        }],
                    };
                } catch (error) {
                    logger.error(`Error reading file ${fullPath}:`, error);
                    throw error;
                }
            }
        );
    }
}

// Helper functions
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function loadDocStructure() {
    const files = await scanDocsDir();
    const structure = {};
    for (const fullPath of files) {
        const relativePath = path.relative(docsDir, fullPath);
        const uri = `mcp://material-web/docs/${relativePath.replace(/\\/g, '/')}`;
        structure[uri] = fullPath;
    }
    return structure;
}

async function extractComponentNames() {
    const componentsDir = path.join(__dirname, '..', 'ui-docs', 'components');
    logger.debug('Extracting component names from:', componentsDir);
    const files = await withTimeout(fs.readdir(componentsDir, { withFileTypes: true }), 5000);
    logger.debug('Files in components dir:', files);
    const components = files.filter(file => file.isFile() && file.name.endsWith('.md')).map(file => file.name.replace('.md', ''));
    logger.debug('Components:', components);
    return components;
}

async function searchContent(keyword) {
    if (!keyword || keyword.trim() === '') {
        return [];
    }
    const files = await scanDocsDir();
    const results = [];
    const regex = new RegExp(escapeRegex(keyword), 'gi');

    for (const fullPath of files) {
        try {
            const content = await withTimeout(fs.readFile(fullPath, 'utf-8'), 5000);
            const lines = content.split('\n');
            const matches = [];
            for (let i = 0; i < lines.length; i++) {
                if (regex.test(lines[i])) {
                    matches.push({
                        line: i + 1,
                        text: lines[i].trim(),
                    });
                }
            }
            if (matches.length > 0) {
                const relativePath = path.relative(docsDir, fullPath);
                results.push({
                    file: relativePath,
                    matches,
                });
            }
        } catch (error) {
            logger.error(`Error reading file ${fullPath}:`, error);
        }
    }
    return results;
}

// New helper functions
async function getComponentDoc(componentName) {
    const filePath = path.join(docsDir, 'components', `${componentName}.md`);
    try {
        const content = await withTimeout(fs.readFile(filePath, 'utf-8'), 5000);
        return content;
    } catch (error) {
        logger.error(`Error reading component doc ${componentName}:`, error);
        return null;
    }
}

async function getThemingDocs() {
    const themingDir = path.join(__dirname, '..', 'ui-docs', 'theming');
    const files = ['README.md', 'color.md', 'shape.md', 'typography.md'];
    let content = '';
    for (const file of files) {
        try {
            const fileContent = await withTimeout(fs.readFile(path.join(themingDir, file), 'utf-8'), 5000);
            content += `## ${file}\n\n${fileContent}\n\n`;
        } catch (error) {
            logger.error(`Error reading theming doc ${file}:`, error);
        }
    }
    return content;
}

async function getInstallationDocs() {
    const filePath = path.join(docsDir, 'quick-start.md');
    try {
        const content = await withTimeout(fs.readFile(filePath, 'utf-8'), 5000);
        return content;
    } catch (error) {
        logger.error('Error reading quick-start.md:', error);
        return null;
    }
}


async function extractApi(componentName) {
    const doc = await getComponentDoc(componentName);
    if (!doc) return null;

    const apiMatch = doc.match(/## API\n\n([\s\S]*?)(?=\n## |\n<!--|$)/);
    if (!apiMatch) return null;

    const apiSection = apiMatch[1];
    const properties = [];
    const tableRegex = /\| Property \| Attribute \| Type \| Default \| Description \|\n\| --- \| --- \| --- \| --- \| --- \|\n((?:\|.*\|\n)*)/g;
    let match;
    while ((match = tableRegex.exec(apiSection)) !== null) {
        const table = match[1];
        const lines = table.split('\n').filter(l => l.trim());
        for (const line of lines) {
            const cells = line.split('|').map(c => c.trim());
            if (cells.length > 1 && cells[1]) {
                properties.push(cells[1]); // Attribute column
            }
        }
    }
    return { properties };
}

async function validateWebsite(html) {
    const $ = cheerio.load(html);
    const components = await extractComponentNames();
    const componentRegex = new RegExp(components.map(escapeRegex).join('|'), 'i');
    const errors = [];
    const warnings = [];

    const elements = $('*').toArray();
    for (const elem of elements) {
        const tag = $(elem).prop('tagName').toLowerCase();
        if (tag.startsWith('md-')) {
            const tagName = tag.replace('md-', '');
            const isValidComponent = componentRegex.test(tagName);
            if (!isValidComponent) {
                errors.push(`Unknown component: ${tag}`);
            } else {
                // Find which component this tag corresponds to
                const matchingComponent = components.find(comp => tagName.includes(comp));
                if (matchingComponent) {
                    let api = apiCache.get(matchingComponent);
                    if (!api) {
                        api = await extractApi(matchingComponent);
                        if (api) apiCache.set(matchingComponent, api);
                    }
                    if (api) {
                        const attrs = Object.keys($(elem).attr());
                        for (const attr of attrs) {
                            if (!api.properties.includes(attr)) {
                                warnings.push(`Unknown attribute '${attr}' for ${tag}`);
                            }
                        }
                    }
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

// Health check function
async function performHealthCheck() {
    const uptime = Date.now() - startTime;
    let docsAccessible = false;
    let docsCount = 0;
    let componentsCount = 0;
    let status = 'healthy';
    let errors = [];

    try {
        const files = await scanDocsDir();
        docsCount = files.length;
        docsAccessible = true;
    } catch (error) {
        status = 'degraded';
        errors.push(`Docs scan failed: ${error.message}`);
        logger.error('Health check: Docs scan failed', error);
    }

    try {
        const components = await extractComponentNames();
        componentsCount = components.length;
    } catch (error) {
        status = 'degraded';
        errors.push(`Component extraction failed: ${error.message}`);
        logger.error('Health check: Component extraction failed', error);
    }

    return {
        status,
        uptime,
        docsAccessible,
        docsCount,
        componentsCount,
        errors
    };
}

// Register tools
logger.info('Registering tools');
logger.info('Registering list_components tool');
server.registerTool(
    'list_components',
    {
        title: 'List Components',
        description: 'Returns a JSON array of available Material Web component names',
        inputSchema: {},
        outputSchema: { components: z.array(z.string()) }
    },
    async () => {
        logger.info('Tool list_components called');
        const components = await extractComponentNames();
        logger.debug('Components extracted:', components);
        const output = { components };
        logger.debug('Returning output:', output);
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);
logger.info('list_components tool registered');

logger.info('Registering search_docs tool');
server.registerTool(
    'search_docs',
    {
        title: 'Search Docs',
        description: 'Searches Material Web documentation for a keyword and returns matching file paths with excerpts',
        inputSchema: { keyword: z.string().min(1, "Keyword must be at least 1 character") },
        outputSchema: { results: z.array(z.object({ file: z.string(), matches: z.array(z.object({ line: z.number(), text: z.string() })) })) }
    },
    async ({ keyword }) => {
        logger.info('Tool search_docs called with keyword:', keyword);
        const results = await searchContent(keyword);
        logger.debug('Search results:', results);
        const output = { results };
        const text = results.map(result =>
            `File: ${result.file}\n${result.matches.map(match => `  Line ${match.line}: ${match.text}`).join('\n')}`
        ).join('\n\n');
        logger.debug('Returning search output:', text || 'No matches found');
        return {
            content: [{ type: 'text', text: text || 'No matches found' }],
            structuredContent: output
        };
    }
);
logger.info('search_docs tool registered');

logger.info('Registering health_check tool');
server.registerTool(
    'health_check',
    {
        title: 'Health Check',
        description: 'Performs a health check on the server, verifying uptime, documentation accessibility, and basic functionality',
        inputSchema: {},
        outputSchema: {
            status: z.string(),
            uptime: z.number(),
            docsAccessible: z.boolean(),
            docsCount: z.number(),
            componentsCount: z.number(),
            errors: z.array(z.string())
        }
    },
    async () => {
        logger.info('Tool health_check called');
        const health = await performHealthCheck();
        const output = health;
        return {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
            structuredContent: output
        };
    }
);
logger.info('health_check tool registered');

logger.info('Registering get_component_doc tool');
server.registerTool(
    'get_component_doc',
    {
        title: 'Get Component Documentation',
        description: 'Returns the full documentation for a specific Material Web component',
        inputSchema: { component: z.string().min(1, "Component name must be at least 1 character") },
        outputSchema: { documentation: z.string() }
    },
    async ({ component }) => {
        logger.info('Tool get_component_doc called with component:', component);
        const doc = await getComponentDoc(component);
        const output = { documentation: doc || 'Component not found' };
        return {
            content: [{ type: 'text', text: output.documentation }],
            structuredContent: output
        };
    }
);
logger.info('get_component_doc tool registered');

logger.info('Registering get_theming_docs tool');
server.registerTool(
    'get_theming_docs',
    {
        title: 'Get Theming Documentation',
        description: 'Returns the theming documentation for Material Web',
        inputSchema: {},
        outputSchema: { documentation: z.string() }
    },
    async () => {
        logger.info('Tool get_theming_docs called');
        const doc = await getThemingDocs();
        const output = { documentation: doc };
        return {
            content: [{ type: 'text', text: output.documentation }],
            structuredContent: output
        };
    }
);
logger.info('get_theming_docs tool registered');

logger.info('Registering get_installation_docs tool');
server.registerTool(
    'get_installation_docs',
    {
        title: 'Get Installation Documentation',
        description: 'Returns the installation and quick-start documentation for Material Web',
        inputSchema: {},
        outputSchema: { documentation: z.string() }
    },
    async () => {
        logger.info('Tool get_installation_docs called');
        const doc = await getInstallationDocs();
        const output = { documentation: doc || 'Documentation not found' };
        return {
            content: [{ type: 'text', text: output.documentation }],
            structuredContent: output
        };
    }
);
logger.info('get_installation_docs tool registered');


logger.info('Registering validate_website tool');
server.registerTool(
    'validate_website',
    {
        title: 'Validate Website',
        description: 'Validates HTML code for correct Material Web component usage',
        inputSchema: { html: z.string().min(1, "HTML must be at least 1 character") },
        outputSchema: {
            valid: z.boolean(),
            errors: z.array(z.string()),
            warnings: z.array(z.string())
        }
    },
    async ({ html }) => {
        logger.info('Tool validate_website called');
        const result = await validateWebsite(html);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            structuredContent: result
        };
    }
);
logger.info('validate_website tool registered');

logger.info('Tools registered');

// Export functions for testing
export {
    registerDocResources,
    loadDocStructure,
    extractComponentNames,
    searchContent,
    escapeRegex,
    scanDocsDir,
    refreshDocCache,
    performHealthCheck,
    getComponentDoc,
    getThemingDocs,
    getInstallationDocs,
    extractApi,
    validateWebsite,
    server
};

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    (async () => {
        logger.info('Registering resources');
        await registerDocResources();
        logger.info('Resources registered');

        const transport = new StdioServerTransport();
        logger.info('Connecting to transport');
        await server.connect(transport);
        logger.info('Connected');
    })().catch(logger.error);
}