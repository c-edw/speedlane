'use strict';

const http = require('http');

const { Speedlane, Request, Response, } = require('../lib/speedlane');

// Start a Speedlane router on port 8080.
const router = new Speedlane();
http.createServer(router.callback).listen(8080);

// Custom response prototype. This applies to all Speedlane router instances.
// Use this for tasks such as body parsing, rather than to serve requests.
Response.awesome = function() {
  this.end('Awesome.');
};

router.use(async(req, res, next) => {
  // Wait for main router. If this completes, the request is unrouted, so we should send a 404.
  await next();
  res.statusCode = 404;
  res.end('404');
})
.on('GET', '/', async(req, res) => {
  // Send some basic text on a GET / request.
  res.end('Hello Speedlane!');
})
.on('GET', '/awesome', async(req, res) => {
  // Use the response prototype we defined earlier.
  res.awesome();
})
.on('GET', '/echo', async(req, res) => {
  // Fetch the request params, returns an object.
  const params = req.getParams();

  // Echo request params back.
  res.end(JSON.stringify(params));
})
.on('POST', '/echo', async(req, res) => {
  // Fetch the request body, returns a Promise.
  const body = await req.getBodyAsync();

  // Echo the request body back.
  res.end(JSON.stringify(body));
});