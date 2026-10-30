'use strict';

// Config-matrix integration tests.
//
// Spawns app.js with a temporary config against a local fake upstream
// resolver, then checks the behaviour of each config combination:
//   - v6_only on/off (A records stripped or passed through)
//   - dns64 + no_aaaa (AAAA synthesised from A, regression for the
//     "Resource record requires name" crash)
//   - dns64_only (native AAAA replaced by DNS64 synthesis)
//   - aggressive_v6 apex fallback
//
// No external network access is used.

const assert = require('assert');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const dns = require('native-dns');

const APP = path.join(__dirname, '..', 'app.js');

// pick ports that are unlikely to collide
const BASE_PORT = 15000 + (process.pid % 1000);
const UPSTREAM_PORT = BASE_PORT;

// ---- fake upstream resolver ----

const upstream = dns.createServer({ dgram_type: 'udp6' });

upstream.on('request', function (req, res) {
    const q = req.question[0];
    const name = q.name.replace(/\.$/, '');

    if (q.type === 28) {
        // native.test has a native AAAA and must be synthesised under dns64_only
        if (name === 'native.test') {
            res.answer.push(dns.AAAA({ name: q.name, address: '2001:db8::1', ttl: 60 }));
        }
        // every other AAAA query gets an empty NOERROR (IPv4-only domain)
        res.send();
        return;
    }

    if (q.type === 1) {
        if (name === 'aonly.test' || name === 'native.test' || name === 'noaaaa.test') {
            res.answer.push(dns.A({ name: q.name, address: '192.0.2.10', ttl: 60 }));
        }
        res.send();
        return;
    }

    res.send();
});

// ---- helpers ----

function baseConfig(port, overrides) {
    return Object.assign({
        dns_resolver: '::1',
        dns_resolver_port: String(UPSTREAM_PORT),
        self_resolver: '::1',
        self_port: String(port),
        dns64_range: '64:ff9b::',
        aggressive_v6: false,
        v6_only: false,
        remove_v4_if_v6_exist: false,
        dns64: false,
        dns64_only: false,
        no_aaaa: [],
        add_aaaa: {},
    }, overrides);
}

function startApp(port, overrides) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ipv6dns-'));
    const cfgPath = path.join(dir, 'config.json');
    fs.writeFileSync(cfgPath, JSON.stringify(baseConfig(port, overrides), null, 2));

    const child = spawn(process.execPath, [APP], {
        env: Object.assign({}, process.env, { IPV6DNS_CONFIG: cfgPath }),
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    child.stdout.on('data', (d) => { output += d; });
    child.stderr.on('data', (d) => { output += d; });

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            child.kill('SIGKILL');
            reject(new Error('app did not start in time:\n' + output));
        }, 5000);

        const onData = () => {
            if (output.indexOf('server listening') !== -1) {
                clearTimeout(timer);
                child.stdout.removeListener('data', onData);
                resolve({
                    child: child,
                    output: () => output,
                    stop: () => new Promise((done) => {
                        child.once('exit', done);
                        child.kill('SIGTERM');
                    }),
                });
            }
        };
        child.stdout.on('data', onData);

        child.once('exit', (code) => {
            clearTimeout(timer);
            reject(new Error('app exited early (' + code + '):\n' + output));
        });
    });
}

function query(port, name, type) {
    return new Promise((resolve, reject) => {
        const req = dns.Request({
            question: dns.Question({ name: name, type: type }),
            server: { address: '::1', port: port, type: 'udp6' },
            timeout: 2000,
        });
        req.on('timeout', () => reject(new Error('query timed out: ' + name)));
        req.on('error', reject);
        req.on('message', (err, answer) => resolve(answer));
        req.send();
    });
}

function normaliseName(name) {
    return String(name).replace(/\.$/, '');
}

// ---- test cases ----

const cases = [];
function test(name, fn) { cases.push({ name: name, fn: fn }); }

test('v6_only=false passes A records through', async function (port) {
    const app = await startApp(port, { v6_only: false });
    try {
        const res = await query(port, 'aonly.test', 1);
        assert.strictEqual(res.header.rcode, 0);
        assert.strictEqual(res.answer.length, 1);
        assert.strictEqual(res.answer[0].address, '192.0.2.10');
    } finally {
        await app.stop();
    }
});

test('v6_only=true strips A records but answers NOERROR', async function (port) {
    const app = await startApp(port, { v6_only: true });
    try {
        const res = await query(port, 'aonly.test', 1);
        assert.strictEqual(res.header.rcode, 0);
        assert.strictEqual(res.answer.length, 0);
    } finally {
        await app.stop();
    }
});

test('dns64 + no_aaaa synthesises a named AAAA (no crash)', async function (port) {
    const app = await startApp(port, { dns64: true, no_aaaa: ['noaaaa.test'] });
    try {
        const res = await query(port, 'noaaaa.test', 28);
        assert.strictEqual(res.header.rcode, 0);
        assert.strictEqual(res.answer.length, 1, 'expected one synthesised AAAA');
        assert.strictEqual(normaliseName(res.answer[0].name), 'noaaaa.test');
        assert.ok(String(res.answer[0].address).indexOf('64:ff9b:') === 0,
            'expected DNS64 address, got ' + res.answer[0].address);
    } finally {
        assert.strictEqual(app.child.exitCode, null, 'app crashed:\n' + app.output());
        await app.stop();
    }
});

test('dns64_only replaces a native AAAA with a DNS64 address', async function (port) {
    const app = await startApp(port, { dns64_only: true });
    try {
        const res = await query(port, 'native.test', 28);
        assert.strictEqual(res.header.rcode, 0);
        assert.strictEqual(res.answer.length, 1, 'expected one synthesised AAAA');
        assert.ok(String(res.answer[0].address).indexOf('64:ff9b:') === 0,
            'expected DNS64 address, got ' + res.answer[0].address);
    } finally {
        await app.stop();
    }
});

test('aggressive_v6 apex fallback does not crash without www record', async function (port) {
    const app = await startApp(port, { aggressive_v6: true, v6_only: true });
    try {
        const res = await query(port, 'aonly.test', 28);
        assert.strictEqual(res.header.rcode, 0);
        assert.strictEqual(res.answer.length, 0);
        assert.strictEqual(app.child.exitCode, null, 'app crashed:\n' + app.output());
    } finally {
        await app.stop();
    }
});

// ---- runner ----

upstream.on('listening', async function () {
    let failed = 0;
    let port = BASE_PORT + 1;

    for (const c of cases) {
        try {
            await c.fn(port++);
            console.log('ok -', c.name);
        } catch (e) {
            failed++;
            console.error('not ok -', c.name);
            console.error('   ', e.message);
        }
    }

    upstream.close();

    if (failed > 0) {
        console.error(failed + ' config test(s) failed');
        process.exit(1);
    }
    console.log('All Config Tests Passed');
    process.exit(0);
});

upstream.on('error', function (err) {
    console.error('failed to start fake upstream:', err);
    process.exit(1);
});

upstream.serve(UPSTREAM_PORT, '::1');
