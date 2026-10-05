// Makes stdout blocking, so `node --test --test-force-exit` cannot drop output still queued when it exits.
"use strict";
const handle = process.stdout._handle;
if (handle && typeof handle.setBlocking === "function") handle.setBlocking(true);
