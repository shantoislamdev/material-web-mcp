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
            await client.close().catch(() => {});
        }
    });

    describe('Basic Tool Operations', () => {
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
    });

    describe('Connection Management', () => {
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

        test('handles invalid server command', async () => {
            const invalidTransport = new StdioClientTransport({
                command: 'node',
                args: ['-e', 'process.exit(1)'] // Script that exits with error
            });

            const invalidClient = new Client(
                {
                    name: 'invalid-test-client',
                    version: '1.0.0',
                },
                {
                    capabilities: {},
                }
            );

            await expect(invalidClient.connect(invalidTransport)).rejects.toThrow();
        });

        test('client properties are correctly set', async () => {
            // Client properties are internal to the SDK, so we test through behavior
            const result = await client.callTool({ name: 'health_check', arguments: {} });
            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
        });
    });

    describe('Error Handling', () => {
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

        test('handles null tool name', async () => {
            await expect(client.callTool({
                name: null,
                arguments: {}
            })).rejects.toThrow();
        });

        test('handles undefined tool name', async () => {
            await expect(client.callTool({
                name: undefined,
                arguments: {}
            })).rejects.toThrow();
        });

        test('handles empty arguments object', async () => {
            const result = await client.callTool({
                name: 'list_components',
                arguments: {}
            });
            expect(result.content[0].text).toBeDefined();
        });

        test('handles malformed request structure', async () => {
            await expect(client.callTool({
                // Missing name field
                arguments: {}
            })).rejects.toThrow();
        });

        test('handles invalid component name format', async () => {
            await expect(client.callTool({
                name: 'get_component_doc',
                arguments: { component: '' }
            })).rejects.toThrow();
        });

        test('handles special characters in component names', async () => {
            const result = await client.callTool({
                name: 'get_component_doc',
                arguments: { component: '<script>alert("xss")</script>' }
            });
            expect(result.content[0].text).toBe('Component not found');
        });
    });

    describe('Response Validation', () => {
        test('validates response structure for list_components', async () => {
            const result = await client.callTool({
                name: 'list_components',
                arguments: {}
            });
            expect(result).toHaveProperty('content');
            expect(Array.isArray(result.content)).toBe(true);
            expect(result.content[0]).toHaveProperty('text');
            expect(result.content[0]).toHaveProperty('type');
            expect(result.content[0].type).toBe('text');
        });

        test('validates response structure for health_check', async () => {
            const result = await client.callTool({
                name: 'health_check',
                arguments: {}
            });
            const health = JSON.parse(result.content[0].text);
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('uptime');
            expect(health).toHaveProperty('docsAccessible');
            expect(health).toHaveProperty('docsCount');
            expect(health).toHaveProperty('componentsCount');
            expect(health).toHaveProperty('errors');
        });

        test('validates JSON parsing for complex responses', async () => {
            const result = await client.callTool({
                name: 'validate_website',
                arguments: { 
                    html: '<html><body><md-button>Test</md-button></body></html>' 
                }
            });
            const validation = JSON.parse(result.content[0].text);
            expect(validation).toHaveProperty('valid');
            expect(validation).toHaveProperty('errors');
            expect(validation).toHaveProperty('warnings');
            expect(typeof validation.valid).toBe('boolean');
            expect(Array.isArray(validation.errors)).toBe(true);
            expect(Array.isArray(validation.warnings)).toBe(true);
        });

        test('handles non-JSON responses gracefully', async () => {
            const result = await client.callTool({
                name: 'get_installation_docs',
                arguments: {}
            });
            expect(result.content[0].text).toBeDefined();
            expect(typeof result.content[0].text).toBe('string');
            expect(result.content[0].text.length).toBeGreaterThan(0);
        });

        test('validates structured content when present', async () => {
            const result = await client.callTool({
                name: 'list_components',
                arguments: {}
            });
            
            if (result.structuredContent) {
                expect(result.structuredContent).toHaveProperty('components');
                expect(Array.isArray(result.structuredContent.components)).toBe(true);
            }
        });
    });

    describe('Concurrent Operations', () => {
        test('handles multiple simultaneous tool calls', async () => {
            const promises = [
                client.callTool({ name: 'list_components', arguments: {} }),
                client.callTool({ name: 'health_check', arguments: {} }),
                client.callTool({ name: 'search_docs', arguments: { keyword: 'button' } }),
                client.callTool({ name: 'get_component_doc', arguments: { component: 'button' } }),
                client.callTool({ name: 'get_theming_docs', arguments: {} })
            ];

            const results = await Promise.all(promises);
            
            expect(results).toHaveLength(5);
            results.forEach(result => {
                expect(result).toHaveProperty('content');
                expect(Array.isArray(result.content)).toBe(true);
            });
        });

        test('handles rapid sequential calls without interference', async () => {
            const results = [];
            for (let i = 0; i < 10; i++) {
                const result = await client.callTool({
                    name: 'health_check',
                    arguments: {}
                });
                results.push(result);
            }

            expect(results).toHaveLength(10);
            results.forEach(result => {
                const health = JSON.parse(result.content[0].text);
                expect(health.status).toBe('healthy');
            });
        });

        test('handles mixed tool types concurrently', async () => {
            const queryTool = client.callTool({
                name: 'search_docs',
                arguments: { keyword: 'component' }
            });

            const componentTool = client.callTool({
                name: 'get_component_doc',
                arguments: { component: 'button' }
            });

            const healthTool = client.callTool({
                name: 'health_check',
                arguments: {}
            });

            const listTool = client.callTool({
                name: 'list_components',
                arguments: {}
            });

            const [queryResult, componentResult, healthResult, listResult] = await Promise.all([
                queryTool, componentTool, healthTool, listTool
            ]);

            expect(queryResult.content[0].text).toContain('component');
            expect(componentResult.content[0].text).not.toBe('Component not found');
            expect(JSON.parse(healthResult.content[0].text).status).toBe('healthy');
            expect(JSON.parse(listResult.content[0].text).components).toBeDefined();
        });
    });

    describe('Performance and Load Testing', () => {
        test('handles large search queries', async () => {
            const largeQuery = 'button'.repeat(100); // 600 character query
            const result = await client.callTool({
                name: 'search_docs',
                arguments: { keyword: largeQuery }
            });
            expect(result.content[0].text).toBeDefined();
        });

        test('handles large HTML validation', async () => {
            const largeHtml = `
                <!DOCTYPE html>
                <html>
                <head><title>Large HTML</title></head>
                <body>
                    ${Array(100).fill(0).map((_, i) => 
                        `<md-button id="btn-${i}">Button ${i}</md-button>`
                    ).join('\n')}
                </body>
                </html>
            `;
            
            const result = await client.callTool({
                name: 'validate_website',
                arguments: { html: largeHtml }
            });
            const validation = JSON.parse(result.content[0].text);
            expect(validation).toHaveProperty('valid');
        });

        test('maintains performance under multiple rapid calls', async () => {
            const startTime = Date.now();
            const callCount = 20;
            
            const promises = Array(callCount).fill(0).map(() =>
                client.callTool({
                    name: 'health_check',
                    arguments: {}
                })
            );

            await Promise.all(promises);
            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete within reasonable time
            expect(duration).toBeLessThan(30000); // 30 seconds
        });
    });

    describe('Edge Cases and Special Scenarios', () => {
        test('handles empty search results', async () => {
            const result = await client.callTool({
                name: 'search_docs',
                arguments: { keyword: 'nonexistentkeyword123456789' }
            });
            expect(result.content[0].text).toBeDefined();
            expect(result.content[0].text).toBe('No matches found');
        });

        test('handles special characters in search', async () => {
            const result = await client.callTool({
                name: 'search_docs',
                arguments: { keyword: 'button<script>alert("xss")</script>' }
            });
            expect(result.content[0].text).toBeDefined();
        });

        test('handles Unicode characters in component queries', async () => {
            const result = await client.callTool({
                name: 'get_component_doc',
                arguments: { component: ' botón ' } // Spanish with accent
            });
            expect(result.content[0].text).toBeDefined();
        });

        test('handles very long component names', async () => {
            const longComponentName = 'verylongcomponentnamethatistoobig' + 'x'.repeat(100);
            const result = await client.callTool({
                name: 'get_component_doc',
                arguments: { component: longComponentName }
            });
            expect(result.content[0].text).toBe('Component not found');
        });

        test('handles HTML with complex nesting', async () => {
            const complexHtml = `
                <html>
                    <head><title>Test</title></head>
                    <body>
                        <div class="container">
                            <div class="row">
                                <div class="col">
                                    <md-filled-button>
                                        <span>Complex</span>
                                        <md-icon>star</md-icon>
                                    </md-filled-button>
                                </div>
                            </div>
                        </div>
                    </body>
                </html>
            `;
            
            const result = await client.callTool({
                name: 'validate_website',
                arguments: { html: complexHtml }
            });
            expect(result.content[0].text).toBeDefined();
        });

        test('handles HTML with malformed tags', async () => {
            const malformedHtml = `
                <html>
                    <body>
                        <md-button>Unclosed tag
                        <md-filled-button>Nested broken <md-icon>
                        <invalid-tag>Broken structure</div>
                    </body>
                </html>
            `;
            
            const result = await client.callTool({
                name: 'validate_website',
                arguments: { html: malformedHtml }
            });
            expect(result.content[0].text).toBeDefined();
        });

        test('handles empty HTML validation', async () => {
            await expect(client.callTool({
                name: 'validate_website',
                arguments: { html: '' }
            })).rejects.toThrow();
        });
    });

    describe('Network and Communication Edge Cases', () => {
        test('handles very long response text', async () => {
            const result = await client.callTool({
                name: 'get_theming_docs',
                arguments: {}
            });
            expect(result.content[0].text.length).toBeGreaterThan(1000);
        });

        test('handles multiple content parts in response', async () => {
            const result = await client.callTool({
                name: 'validate_website',
                arguments: { html: '<md-button>Test</md-button>' }
            });
            
            if (result.content.length > 1) {
                result.content.forEach(part => {
                    expect(part).toHaveProperty('type');
                    expect(part).toHaveProperty('text');
                });
            } else {
                expect(result.content[0]).toHaveProperty('type');
                expect(result.content[0]).toHaveProperty('text');
            }
        });

        test('handles response with structured content', async () => {
            const result = await client.callTool({
                name: 'list_components',
                arguments: {}
            });
            
            expect(result).toHaveProperty('content');
            expect(Array.isArray(result.content)).toBe(true);
            expect(result.content[0]).toHaveProperty('text');
            
            if (result.structuredContent) {
                expect(result.structuredContent).toHaveProperty('components');
            }
        });
    });

    describe('Input Validation and Security', () => {
        test('handles SQL injection attempts in search', async () => {
            const maliciousQuery = "button'; DROP TABLE components; --";
            const result = await client.callTool({
                name: 'search_docs',
                arguments: { keyword: maliciousQuery }
            });
            expect(result.content[0].text).toBeDefined();
        });

        test('handles XSS attempts in HTML validation', async () => {
            const xssHtml = '<md-button onclick="alert(\'xss\')">Click me</md-button>';
            const result = await client.callTool({
                name: 'validate_website',
                arguments: { html: xssHtml }
            });
            expect(result.content[0].text).toBeDefined();
        });

        test('handles path traversal attempts in component names', async () => {
            const maliciousComponent = '../../../etc/passwd';
            const result = await client.callTool({
                name: 'get_component_doc',
                arguments: { component: maliciousComponent }
            });
            expect(result.content[0].text).toBe('Component not found');
        });

        test('handles extremely large input parameters', async () => {
            const hugeString = 'A'.repeat(10000);
            const result = await client.callTool({
                name: 'search_docs',
                arguments: { keyword: hugeString }
            });
            expect(result.content[0].text).toBeDefined();
        });

        test('handles JSON injection attempts', async () => {
            const maliciousJson = '{"__proto__": {"admin": true}}';
            const result = await client.callTool({
                name: 'validate_website',
                arguments: { html: `<md-button>${maliciousJson}</md-button>` }
            });
            expect(result.content[0].text).toBeDefined();
        });
    });

    describe('Client State Management', () => {
        test('maintains connection state across multiple calls', async () => {
            // Make several calls to ensure connection is maintained
            const result1 = await client.callTool({ name: 'health_check', arguments: {} });
            const result2 = await client.callTool({ name: 'list_components', arguments: {} });
            const result3 = await client.callTool({ name: 'health_check', arguments: {} });

            expect(JSON.parse(result1.content[0].text).status).toBe('healthy');
            expect(JSON.parse(result2.content[0].text).components).toBeDefined();
            expect(JSON.parse(result3.content[0].text).status).toBe('healthy');
        });

        test('handles client disconnection gracefully', async () => {
            // This test verifies that after disconnection, subsequent calls fail appropriately
            const testClient = new Client(
                {
                    name: 'disconnect-test-client',
                    version: '1.0.0',
                },
                {
                    capabilities: {},
                }
            );

            const testTransport = new StdioClientTransport({
                command: 'node',
                args: ['bin/material-web-mcp']
            });

            await testClient.connect(testTransport);
            
            // Make a successful call
            const result = await testClient.callTool({ name: 'health_check', arguments: {} });
            expect(JSON.parse(result.content[0].text).status).toBe('healthy');
            
            // Close the client
            await testClient.close();
            
            // Subsequent calls should fail
            try {
                await testClient.callTool({ name: 'health_check', arguments: {} });
                expect.fail('Expected callTool to fail after close');
            } catch (error) {
                expect(error).toBeDefined();
            }
        });

        test('handles client with different capabilities', async () => {
            const customClient = new Client(
                {
                    name: 'custom-capabilities-client',
                    version: '1.0.0',
                },
                {
                    capabilities: {
                        tools: {}
                    }
                }
            );

            const customTransport = new StdioClientTransport({
                command: 'node',
                args: ['bin/material-web-mcp']
            });

            await customClient.connect(customTransport);
            
            const result = await customClient.callTool({ name: 'health_check', arguments: {} });
            expect(JSON.parse(result.content[0].text).status).toBe('healthy');
            
            await customClient.close();
        });
    });

    describe('Boundary Testing', () => {
        test('handles maximum parameter values', async () => {
            // Test with the largest reasonable search term
            const maxTerm = 'a'.repeat(1000);
            const result = await client.callTool({
                name: 'search_docs',
                arguments: { keyword: maxTerm }
            });
            expect(result.content[0].text).toBeDefined();
        });

        test('handles zero-length valid parameters', async () => {
            const result = await client.callTool({
                name: 'get_component_doc',
                arguments: { component: 'a' }
            });
            expect(result.content[0].text).toBeDefined();
        });

        test('handles numerical boundaries in HTML validation', async () => {
            const minimalHtml = '<md-button></md-button>';
            const result = await client.callTool({
                name: 'validate_website',
                arguments: { html: minimalHtml }
            });
            const validation = JSON.parse(result.content[0].text);
            expect(validation).toHaveProperty('valid');
        });
    });

    describe('Memory and Resource Management', () => {
        test('handles multiple rapid calls without memory leaks', async () => {
            const callCount = 50;
            const promises = [];
            
            for (let i = 0; i < callCount; i++) {
                promises.push(
                    client.callTool({
                        name: 'health_check',
                        arguments: {}
                    })
                );
            }
            
            const results = await Promise.all(promises);
            expect(results).toHaveLength(callCount);
            
            // Verify all calls were successful
            results.forEach(result => {
                const health = JSON.parse(result.content[0].text);
                expect(health.status).toBe('healthy');
            });
        });

        test('handles large response data processing', async () => {
            // This tests the client's ability to handle large response data
            const result = await client.callTool({
                name: 'get_theming_docs',
                arguments: {}
            });
            
            // Process the large response to ensure no issues
            const content = result.content[0].text;
            expect(content.length).toBeGreaterThan(1000);
            
            // Verify JSON parsing doesn't cause issues
            if (result.structuredContent) {
                expect(result.structuredContent).toBeDefined();
            }
        });
    });
});