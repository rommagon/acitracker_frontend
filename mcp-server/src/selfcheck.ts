#!/usr/bin/env node

import { ENDPOINTS, BACKEND_BASE_URL } from './config/endpoints.js';

interface EndpointCheck {
  endpoint: string;
  status: string;
  responseTimeMs: number;
  error?: string;
}

async function checkEndpoint(url: string): Promise<EndpointCheck> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    });

    const responseTimeMs = Date.now() - startTime;

    if (response.ok) {
      return {
        endpoint: url,
        status: `${response.status} OK`,
        responseTimeMs
      };
    } else {
      return {
        endpoint: url,
        status: `${response.status} ${response.statusText}`,
        responseTimeMs,
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      endpoint: url,
      status: 'FAILED',
      responseTimeMs,
      error: errorMessage
    };
  }
}

async function runSelfCheck() {
  console.log('================================================================================');
  console.log('           ACITRACK MCP SERVER - ENDPOINT VERIFICATION');
  console.log('================================================================================\n');

  console.log(`Backend Base URL: ${BACKEND_BASE_URL}\n`);

  const endpointsToCheck = [
    { name: 'Health', url: ENDPOINTS.HEALTH },
    { name: 'Manifest', url: ENDPOINTS.MANIFEST },
    { name: 'Must-Reads', url: ENDPOINTS.MUST_READS },
    { name: 'Summaries', url: ENDPOINTS.SUMMARIES }
  ];

  console.log('Checking endpoints...\n');

  const results: EndpointCheck[] = [];

  for (const { name, url } of endpointsToCheck) {
    process.stdout.write(`  ${name.padEnd(15)} `);
    const result = await checkEndpoint(url);
    results.push(result);

    const statusSymbol = result.status.includes('OK') ? '✓' : '✗';
    const statusColor = result.status.includes('OK') ? '\x1b[32m' : '\x1b[31m';
    const resetColor = '\x1b[0m';

    console.log(`${statusColor}${statusSymbol}${resetColor} ${result.status.padEnd(20)} ${result.responseTimeMs}ms`);

    if (result.error && !result.status.includes('OK')) {
      console.log(`                  Error: ${result.error}`);
    }
  }

  console.log('\n================================================================================');
  console.log('ENDPOINT SUMMARY');
  console.log('================================================================================\n');

  const maxEndpointLength = Math.max(...results.map(r => r.endpoint.length));

  console.log(`${'Endpoint'.padEnd(maxEndpointLength + 2)} | Status              | Response Time`);
  console.log(`${'-'.repeat(maxEndpointLength + 2)}-+-${'-'.repeat(20)}-+-${'-'.repeat(14)}`);

  for (const result of results) {
    const endpoint = result.endpoint.padEnd(maxEndpointLength + 2);
    const status = result.status.padEnd(20);
    const time = `${result.responseTimeMs}ms`.padEnd(14);
    console.log(`${endpoint} | ${status} | ${time}`);
  }

  console.log('\n');

  const successCount = results.filter(r => r.status.includes('OK')).length;
  const totalCount = results.length;

  if (successCount === totalCount) {
    console.log('\x1b[32m✓ All endpoints are healthy!\x1b[0m');
    process.exit(0);
  } else {
    console.log(`\x1b[33m⚠ ${totalCount - successCount} endpoint(s) failed\x1b[0m`);
    process.exit(1);
  }
}

runSelfCheck().catch(error => {
  console.error('\x1b[31mFatal error during selfcheck:\x1b[0m', error);
  process.exit(1);
});
