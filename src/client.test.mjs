import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

describe('MCP Client Tests', () => {
    let client;
    let transport;

    beforeAll(async () => {
        transport = new StdioClientTransport({
            command: 'node',
            args: ['bin/material-web-mcp']
        });

        client = new Client(
            {
                name: 'material-web-test-client',
                version: '1.0.0',
            },
            {
                capabilities: {},
            }
        );

        await client.connect(transport);
    }, 30000);

    afterAll(async () => {
        if (client) {
            await client.close();
        }
    });

    test('list_components returns component array', async () => {
        const result = await client.callTool({
            name: 'list_components',
            arguments: {}
        });
        const components = JSON.parse(result.content[0].text);
        expect(components.components).toBeDefined();
        expect(Array.isArray(components.components)).toBe(true);
        expect(components.components.length).toBeGreaterThan(0);
    });

    test('health_check returns healthy status', async () => {
        const result = await client.callTool({
            name: 'health_check',
            arguments: {}
        });
        const health = JSON.parse(result.content[0].text);
        expect(health.status).toBe('healthy');
        expect(health.uptime).toBeGreaterThan(0);
        expect(health.docsAccessible).toBe(true);
        expect(health.docsCount).toBeGreaterThan(0);
        expect(health.componentsCount).toBeGreaterThan(0);
        expect(health.errors).toEqual([]);
    });

    test('search_docs finds button-related content', async () => {
        const result = await client.callTool({
            name: 'search_docs',
            arguments: { keyword: 'button' }
        });
        expect(result.content[0].text).toContain('button');
    });

    test('get_component_doc returns button documentation', async () => {
        const result = await client.callTool({
            name: 'get_component_doc',
            arguments: { component: 'button' }
        });
        expect(result.content[0].text).not.toBe('Component not found');
        expect(result.content[0].text.length).toBeGreaterThan(100);
    });

    test('get_theming_docs returns theming documentation', async () => {
        const result = await client.callTool({
            name: 'get_theming_docs',
            arguments: {}
        });
        expect(result.content[0].text.length).toBeGreaterThan(100);
    });

    test('get_installation_docs returns installation documentation', async () => {
        const result = await client.callTool({
            name: 'get_installation_docs',
            arguments: {}
        });
        expect(result.content[0].text).not.toBe('Documentation not found');
        expect(result.content[0].text.length).toBeGreaterThan(100);
    });

    test('validate_website validates Material Web components', async () => {
        const html = `
        <!DOCTYPE html>
        <html>
        <body>
            <md-filled-button>Click me</md-filled-button>
            <md-outlined-text-field label="Name"></md-outlined-text-field>
        </body>
        </html>`;
        const result = await client.callTool({
            name: 'validate_website',
            arguments: { html }
        });
        const validation = JSON.parse(result.content[0].text);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toEqual([]);
    });

    test('handles server startup failure', async () => {
        const failingTransport = new StdioClientTransport({
            command: 'nonexistent-command'
        });

        const failingClient = new Client(
            {
                name: 'failing-test-client',
                version: '1.0.0',
            },
            {
                capabilities: {},
            }
        );

        await expect(failingClient.connect(failingTransport)).rejects.toThrow();
    });

    test('handles tool invocation with invalid arguments', async () => {
        await expect(client.callTool({
            name: 'search_docs',
            arguments: { keyword: '' }
        })).rejects.toThrow();
    });

    test('handles tool invocation with missing arguments', async () => {
        await expect(client.callTool({
            name: 'search_docs',
            arguments: {}
        })).rejects.toThrow();
    });

    test('handles unknown tool name', async () => {
        await expect(client.callTool({
            name: 'unknown_tool',
            arguments: {}
        })).rejects.toThrow();
    });
});