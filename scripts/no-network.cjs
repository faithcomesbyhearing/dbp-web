'use strict';
// scripts/no-network.cjs: a socket guard for test runs only. scripts/gate's unit step and scripts/check-test-rejects
// load it with `node --require`. It wraps net.Socket.prototype.connect and refuses any connection that isn't to this
// machine (a loopback address, localhost or a unix socket): the socket fails at once with ECONNREFUSED instead of
// reaching the network. http, https, tls, fetch (undici), axios and jsdom all connect through net.Socket, so this one
// patch covers them, including clients that ignore the proxy variables. No dependencies. Changing this file is class 2.
const net = require('net');

const originalConnect = net.Socket.prototype.connect;

function isLocal(host) {
  if (host === undefined || host === null || host === '') return true; // Node defaults to localhost
  const h = String(host).toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h === '::1') return true;
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  return /^::ffff:127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h);
}

// connect(options[, cb]), connect(path[, cb]), connect(port[, host][, cb]), or Node's internal [options, cb] array
function target(args) {
  const a = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  const first = a[0];
  if (first !== null && typeof first === 'object') {
    if (first.path) return { local: true };
    return { local: isLocal(first.host), host: first.host, port: first.port };
  }
  if (typeof first === 'string' && !/^\d+$/.test(first)) return { local: true }; // a unix socket path
  const host = typeof a[1] === 'string' ? a[1] : undefined;
  return { local: isLocal(host), host, port: first };
}

net.Socket.prototype.connect = function guardedConnect(...args) {
  let t;
  try {
    t = target(args);
  } catch (e) {
    t = { local: false, host: '?', port: '?' };
  }
  if (t.local) return originalConnect.apply(this, args);
  const err = new Error(`gate: network blocked (${t.host}:${t.port})`);
  err.code = 'ECONNREFUSED';
  process.nextTick(() => this.destroy(err));
  return this;
};
