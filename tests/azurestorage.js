var assert = require('assert');
var azurestorage = require('../providers/azurestorage');

// check_for_azurestorage_hostname
assert.equal(azurestorage.check_for_azurestorage_hostname("blob.blz25prdstr03a.store.core.windows.net"), "blob-ds.blz25prdstr03a.store.core.windows.net");
assert.equal(azurestorage.check_for_azurestorage_hostname("blob.iad04prdstr01a.store.core.windows.net"), "blob-ds.iad04prdstr01a.store.core.windows.net");
assert.equal(azurestorage.check_for_azurestorage_hostname("blob.blz25prdstr01a.store.core.windows.net"), "blob-ds.blz25prdstr01a.store.core.windows.net");
assert.equal(azurestorage.check_for_azurestorage_hostname("file.blz25prdstr01a.store.core.windows.net"), "file-ds.blz25prdstr01a.store.core.windows.net");
assert.equal(azurestorage.check_for_azurestorage_hostname("queue.blz25prdstr01a.store.core.windows.net"), "queue-ds.blz25prdstr01a.store.core.windows.net");
assert.equal(azurestorage.check_for_azurestorage_hostname("table.blz25prdstr01a.store.core.windows.net"), "table-ds.blz25prdstr01a.store.core.windows.net");
assert.equal(azurestorage.check_for_azurestorage_hostname("dfs.blz25prdstr01a.store.core.windows.net"), "dfs-ds.blz25prdstr01a.store.core.windows.net");
assert.equal(azurestorage.check_for_azurestorage_hostname("web.mwh23prdstr01c.store.core.windows.net"), "web-ds.mwh23prdstr01c.store.core.windows.net");
assert.equal(azurestorage.check_for_azurestorage_hostname("web.blz25prdstr01a.store.core.windows.net"), "web-ds.blz25prdstr01a.store.core.windows.net");
assert.equal(azurestorage.check_for_azurestorage_hostname("blob.blz25prdstr01a.store.core.windows.net."), "blob-ds.blz25prdstr01a.store.core.windows.net");

// already dual-stack
assert.equal(azurestorage.check_for_azurestorage_hostname("blob-ds.blz25prdstr01a.store.core.windows.net"), false);

// not a storage cluster target
assert.equal(azurestorage.check_for_azurestorage_hostname("blob.core.windows.net"), false);
assert.equal(azurestorage.check_for_azurestorage_hostname("account.blob.core.windows.net"), false);
assert.equal(azurestorage.check_for_azurestorage_hostname("blob.foo.bar.store.core.windows.net"), false);
assert.equal(azurestorage.check_for_azurestorage_hostname("unknown.blz25prdstr01a.store.core.windows.net"), false);
assert.equal(azurestorage.check_for_azurestorage_hostname("blob.blz25prdstr01a.store.core.windows.com"), false);
assert.equal(azurestorage.check_for_azurestorage_hostname("example.com"), false);
assert.equal(azurestorage.check_for_azurestorage_hostname(null), false);
assert.equal(azurestorage.check_for_azurestorage_hostname(undefined), false);

console.log("All Tests Passed");
