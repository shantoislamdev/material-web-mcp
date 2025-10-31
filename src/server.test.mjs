import fs from 'fs/promises';
import path from 'path';

let escapeRegex, extractComponentNames, searchContent, loadDocStructure, registerDocResources, performHealthCheck, getComponentDoc, getThemingDocs, getInstallationDocs, extractApi, validateWebsite, server, refreshDocCache;

beforeAll(async () => {
    const module = await import('./server.js');
    escapeRegex = module.escapeRegex;
    extractComponentNames = module.extractComponentNames;
    searchContent = module.searchContent;
    loadDocStructure = module.loadDocStructure;
    registerDocResources = module.registerDocResources;
    performHealthCheck = module.performHealthCheck;
    getComponentDoc = module.getComponentDoc;
    getThemingDocs = module.getThemingDocs;
    getInstallationDocs = module.getInstallationDocs;
    extractApi = module.extractApi;
    validateWebsite = module.validateWebsite;
    server = module.server;
    refreshDocCache = module.refreshDocCache;
});

// Mock winston to avoid console logs
jest.mock('winston', () => ({
    createLogger: jest.fn(() => ({
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
    })),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        errors: jest.fn(),
        json: jest.fn(),
        colorize: jest.fn(),
        simple: jest.fn()
    },
    transports: {
        Console: jest.fn()
    }
}));

// Mock MCP SDK
jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
    McpServer: jest.fn(() => ({
        registerResource: jest.fn(),
        registerTool: jest.fn(),
        connect: jest.fn()
    }))
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
    StdioServerTransport: jest.fn()
}));

jest.mock('zod', () => ({
    z: {
        string: jest.fn(() => ({
            min: jest.fn(() => ({ optional: jest.fn() }))
        })),
        array: jest.fn(() => jest.fn()),
        object: jest.fn(() => jest.fn()),
        number: jest.fn(),
        boolean: jest.fn()
    }
}));

describe('escapeRegex', () => {
    it('should escape special regex characters', () => {
        expect(escapeRegex('test.*+?^${}()|[]\\')).toBe('test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });

    it('should handle normal strings', () => {
        expect(escapeRegex('normal string')).toBe('normal string');
    });
});

describe('extractComponentNames', () => {
    const originalReaddir = fs.readdir;

    afterEach(() => {
        fs.readdir = originalReaddir;
        refreshDocCache();
    });

    it('should return component names from .md files', async () => {
        fs.readdir = jest.fn().mockResolvedValue([
            { name: 'button.md', isFile: () => true, isDirectory: () => false },
            { name: 'checkbox.md', isFile: () => true, isDirectory: () => false },
            { name: 'other.txt', isFile: () => true, isDirectory: () => false }
        ]);

        const result = await extractComponentNames();
        expect(result).toEqual(['button', 'checkbox']);
    });

    it('should throw on error', async () => {
        fs.readdir = jest.fn().mockRejectedValue(new Error('fs error'));

        await expect(extractComponentNames()).rejects.toThrow('fs error');
    });
});

describe('searchContent', () => {
    const originalReaddir = fs.readdir;
    const originalReadFile = fs.readFile;

    afterEach(() => {
        fs.readdir = originalReaddir;
        fs.readFile = originalReadFile;
        refreshDocCache();
    });

    it('should find matches in files', async () => {
        fs.readdir = jest.fn()
            .mockResolvedValueOnce([{ name: 'test.md', isFile: () => true, isDirectory: () => false }])
            .mockResolvedValue([]);

        fs.readFile = jest.fn().mockResolvedValue('line with keyword\nanother line');

        const result = await searchContent('keyword');
        expect(result).toEqual([{
            file: 'test.md',
            matches: [{ line: 1, text: 'line with keyword' }]
        }]);
    });

    it('should handle regex special characters in keyword', async () => {
        fs.readdir = jest.fn()
            .mockResolvedValueOnce([{ name: 'test.md', isFile: () => true, isDirectory: () => false }])
            .mockResolvedValue([]);

        fs.readFile = jest.fn().mockResolvedValue('line with test.*\nanother line');

        const result = await searchContent('test.*');
        expect(result).toEqual([{
            file: 'test.md',
            matches: [{ line: 1, text: 'line with test.*' }]
        }]);
    });

    it('should handle directory traversal', async () => {
        fs.readdir = jest.fn()
            .mockResolvedValueOnce([{ name: 'subdir', isFile: () => false, isDirectory: () => true }])
            .mockResolvedValueOnce([{ name: 'test.md', isFile: () => true, isDirectory: () => false }])
            .mockResolvedValue([]);

        fs.readFile = jest.fn().mockResolvedValue('content with keyword');

        const result = await searchContent('keyword');
        expect(result).toEqual([{
            file: path.join('subdir', 'test.md'),
            matches: [{ line: 1, text: 'content with keyword' }]
        }]);
    });

    it('should return empty array when no matches', async () => {
        fs.readdir = jest.fn()
            .mockResolvedValueOnce([{ name: 'test.md', isFile: () => true, isDirectory: () => false }])
            .mockResolvedValue([]);

        fs.readFile = jest.fn().mockResolvedValue('no match here');

        const result = await searchContent('keyword');
        expect(result).toEqual([]);
    });

    it('should handle fs errors', async () => {
        fs.readdir = jest.fn().mockRejectedValue(new Error('fs error'));

        await expect(searchContent('keyword')).rejects.toThrow('fs error');
    });

    it('should handle empty keyword', async () => {
        const result = await searchContent('');
        expect(result).toEqual([]);
    });

    it('should handle null keyword', async () => {
        const result = await searchContent(null);
        expect(result).toEqual([]);
    });
});

describe('loadDocStructure', () => {
    const originalReaddir = fs.readdir;

    afterEach(() => {
        fs.readdir = originalReaddir;
        refreshDocCache();
    });

    it('should load structure of .md files', async () => {
        fs.readdir = jest.fn()
            .mockResolvedValueOnce([{ name: 'test.md', isFile: () => true, isDirectory: () => false }])
            .mockResolvedValue([]);

        const result = await loadDocStructure();
        expect(result).toEqual({ 'mcp://material-web/docs/test.md': path.join(__dirname, '..', 'ui-docs', 'test.md') });
    });

    it('should handle nested directories', async () => {
        fs.readdir = jest.fn()
            .mockResolvedValueOnce([{ name: 'subdir', isFile: () => false, isDirectory: () => true }])
            .mockResolvedValueOnce([{ name: 'nested.md', isFile: () => true, isDirectory: () => false }])
            .mockResolvedValue([]);

        const result = await loadDocStructure();
        expect(result).toEqual({ 'mcp://material-web/docs/subdir/nested.md': path.join(__dirname, '..', 'ui-docs', 'subdir', 'nested.md') });
    });

    it('should handle fs errors', async () => {
        fs.readdir = jest.fn().mockRejectedValue(new Error('fs error'));

        await expect(loadDocStructure()).rejects.toThrow('fs error');
    });
});

describe('registerDocResources', () => {
    const originalReaddir = fs.readdir;
    const originalReadFile = fs.readFile;

    afterEach(() => {
        fs.readdir = originalReaddir;
        fs.readFile = originalReadFile;
        refreshDocCache();
    });

    it('should register resources for .md files', async () => {
        fs.readdir = jest.fn()
            .mockResolvedValueOnce([{ name: 'test.md', isFile: () => true, isDirectory: () => false }])
            .mockResolvedValue([]);

        fs.readFile = jest.fn().mockResolvedValue('# Test Content');

        await registerDocResources();

        expect(server.registerResource).toHaveBeenCalledWith(
            'test',
            'mcp://material-web/docs/test.md',
            {
                title: 'test',
                description: 'Documentation for test',
                mimeType: 'text/markdown',
            },
            expect.any(Function)
        );
        server.registerResource.mockClear();
    });

    it('should handle nested directories', async () => {
        fs.readdir = jest.fn()
            .mockResolvedValueOnce([{ name: 'subdir', isFile: () => false, isDirectory: () => true }])
            .mockResolvedValueOnce([{ name: 'nested.md', isFile: () => true, isDirectory: () => false }])
            .mockResolvedValue([]);

        fs.readFile = jest.fn().mockResolvedValue('# Nested Content');

        await registerDocResources();

        expect(server.registerResource).toHaveBeenCalledWith(
            'subdir-nested',
            'mcp://material-web/docs/subdir/nested.md',
            {
                title: 'nested',
                description: 'Documentation for nested',
                mimeType: 'text/markdown',
            },
            expect.any(Function)
        );
        server.registerResource.mockClear();
    });

    it('should validate path security', async () => {
        fs.readdir = jest.fn()
            .mockResolvedValueOnce([{ name: '../outside.md', isFile: () => true, isDirectory: () => false }])
            .mockResolvedValue([]);

        fs.readFile = jest.fn().mockResolvedValue('# Outside Content');

        await registerDocResources();

        // The resource handler should throw on access
        const callArgs = server.registerResource.mock.calls[server.registerResource.mock.calls.length - 1];
        const handler = callArgs[3];

        await expect(handler({ href: 'mcp://material-web/docs/../outside.md' })).rejects.toThrow('Access denied');
        server.registerResource.mockClear();
    });

    it('should handle fs errors', async () => {
        fs.readdir = jest.fn().mockRejectedValue(new Error('fs error'));

        await expect(registerDocResources()).rejects.toThrow('fs error');
    });
});

describe('performHealthCheck', () => {
    const originalReaddir = fs.readdir;

    afterEach(() => {
        fs.readdir = originalReaddir;
        refreshDocCache();
    });

    it('should return healthy status when all checks pass', async () => {
        fs.readdir = jest.fn()
            .mockResolvedValueOnce([
                { name: 'file1.md', isFile: () => true, isDirectory: () => false },
                { name: 'file2.md', isFile: () => true, isDirectory: () => false }
            ])
            .mockResolvedValueOnce([{ name: 'button.md', isFile: () => true, isDirectory: () => false }]);

        const result = await performHealthCheck();

        expect(result.status).toBe('healthy');
        expect(result.uptime).toBeGreaterThan(0);
        expect(result.docsAccessible).toBe(true);
        expect(result.docsCount).toBe(2);
        expect(result.componentsCount).toBe(1);
        expect(result.errors).toEqual([]);
    });

    it('should return degraded status when docs scan fails', async () => {
        fs.readdir = jest.fn()
            .mockRejectedValueOnce(new Error('scan error'))
            .mockResolvedValueOnce([{ name: 'button.md', isFile: () => true, isDirectory: () => false }]);

        const result = await performHealthCheck();

        expect(result.status).toBe('degraded');
        expect(result.docsAccessible).toBe(false);
        expect(result.docsCount).toBe(0);
        expect(result.componentsCount).toBe(1);
        expect(result.errors).toContain('Docs scan failed: scan error');
    });

    it('should return degraded status when component extraction fails', async () => {
        fs.readdir = jest.fn()
            .mockResolvedValueOnce([{ name: 'file.md', isFile: () => true, isDirectory: () => false }])
            .mockRejectedValueOnce(new Error('extract error'));

        const result = await performHealthCheck();

        expect(result.status).toBe('degraded');
        expect(result.docsAccessible).toBe(true);
        expect(result.docsCount).toBe(1);
        expect(result.componentsCount).toBe(0);
        expect(result.errors).toContain('Component extraction failed: extract error');
    });
});

describe('getComponentDoc', () => {
    const originalReadFile = fs.readFile;

    afterEach(() => {
        fs.readFile = originalReadFile;
    });

    it('should return component documentation', async () => {
        fs.readFile = jest.fn().mockResolvedValue('# Button Component\n\nContent here.');

        const result = await getComponentDoc('button');
        expect(result).toBe('# Button Component\n\nContent here.');
    });

    it('should return null on error', async () => {
        fs.readFile = jest.fn().mockRejectedValue(new Error('fs error'));

        const result = await getComponentDoc('button');
        expect(result).toBeNull();
    });
});

describe('getThemingDocs', () => {
    const originalReadFile = fs.readFile;

    afterEach(() => {
        fs.readFile = originalReadFile;
    });

    it('should return theming documentation', async () => {
        fs.readFile = jest.fn()
            .mockResolvedValueOnce('# README Theming')
            .mockResolvedValueOnce('# Color Theming')
            .mockResolvedValueOnce('# Shape Theming')
            .mockResolvedValueOnce('# Typography Theming');

        const result = await getThemingDocs();
        expect(result).toContain('## README.md\n\n# README Theming');
        expect(result).toContain('## color.md\n\n# Color Theming');
    });

    it('should handle read errors gracefully', async () => {
        fs.readFile = jest.fn().mockRejectedValue(new Error('fs error'));

        const result = await getThemingDocs();
        expect(result).toBe('');
    });
});

describe('getInstallationDocs', () => {
    const originalReadFile = fs.readFile;

    afterEach(() => {
        fs.readFile = originalReadFile;
    });

    it('should return installation documentation', async () => {
        fs.readFile = jest.fn().mockResolvedValue('# Quick Start\n\nInstall with npm.');

        const result = await getInstallationDocs();
        expect(result).toBe('# Quick Start\n\nInstall with npm.');
    });

    it('should return null on error', async () => {
        fs.readFile = jest.fn().mockRejectedValue(new Error('fs error'));

        const result = await getInstallationDocs();
        expect(result).toBeNull();
    });
});


describe('extractApi', () => {
    const originalReadFile = fs.readFile;

    afterEach(() => {
        fs.readFile = originalReadFile;
    });

    it('should extract API properties from component doc', async () => {
        const mockDoc = `
## API

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | disabled | boolean | false | Whether disabled |
| label | label | string | '' | The label |
`;

        fs.readFile = jest.fn().mockResolvedValue(mockDoc);

        const result = await extractApi('button');
        expect(result.properties).toContain('disabled');
        expect(result.properties).toContain('label');
    });

    it('should return null if no API section', async () => {
        fs.readFile = jest.fn().mockResolvedValue('# No API');

        const result = await extractApi('button');
        expect(result).toBeNull();
    });

    it('should handle null component name', async () => {
        const result = await extractApi(null);
        expect(result).toBeNull();
    });

    it('should handle empty component name', async () => {
        const result = await extractApi('');
        expect(result).toBeNull();
    });
});

describe('validateWebsite', () => {
    const originalReadFile = fs.readFile;

    afterEach(() => {
        fs.readFile = originalReadFile;
    });

    it('should validate valid Material Web components', async () => {
        fs.readFile = jest.fn().mockResolvedValue(`
## API

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | disabled | boolean | false | Whether disabled |
`);

        const html = '<html><body><md-filled-button disabled>Click</md-filled-button></body></html>';
        const result = await validateWebsite(html);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    it('should detect unknown components', async () => {
        const html = '<html><body><md-unknown>Bad</md-unknown></body></html>';
        const result = await validateWebsite(html);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Unknown component: md-unknown');
    });

    it('should warn on unknown attributes', async () => {
        fs.readFile = jest.fn().mockResolvedValue(`
## API

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | disabled | boolean | false | Whether disabled |
`);

        const html = '<html><body><md-filled-button unknown-attr="value">Click</md-filled-button></body></html>';
        const result = await validateWebsite(html);

        expect(result.valid).toBe(true);
        expect(result.warnings).toContain('Unknown attribute \'unknown-attr\' for md-filled-button');
    });

    it('should handle empty HTML', async () => {
        const result = await validateWebsite('');
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    it('should handle invalid HTML', async () => {
        const result = await validateWebsite('<unclosed tag');
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    it('should handle components without API section', async () => {
        fs.readFile = jest.fn().mockResolvedValue('# Button Component\n\nNo API section.');

        const html = '<html><body><md-filled-button>Click</md-filled-button></body></html>';
        const result = await validateWebsite(html);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    it('should handle extractComponentNames failure', async () => {
        const originalReaddir = fs.readdir;
        fs.readdir = jest.fn().mockRejectedValue(new Error('fs error'));

        const html = '<html><body><md-filled-button>Click</md-filled-button></body></html>';

        await expect(validateWebsite(html)).rejects.toThrow('fs error');

        fs.readdir = originalReaddir;
        refreshDocCache();
    });
});