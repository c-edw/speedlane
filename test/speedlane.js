'use strict';

const http = require('http');
const Promise = require('bluebird');
const { assert } = require('chai');
const request = require('axios');

const { Speedlane, Request, Response, } = require('../lib/speedlane');

let router;
let server;

beforeEach(() => {
  router = new Speedlane(8080);
  server = http.createServer(router.callback).listen(8080);
});

afterEach(() => {
  server.close();
});

describe('Speedlane', function() {
  describe('#on', function() {
    it('should only run if the request route matches', function() {
      const p = new Promise((resolve, reject) => {
        router.on('GET', '/a', (req, res, next) => 
            resolve({ req, res, next })
          )
          .on('GET', '/b', (req, res, next) => 
            reject({ req, res, next })
          );
      }).then(({ req, res, next }) => {
        res.end();
        assert.ok(true);
      }).catch(({ req, res, next }) => {
        res.end();
        assert.ok(false);
      });
      
      request.get('http://localhost:8080/a');
      
      return p;
    });

    it('should only run if the request method matches', function() {
      const p = new Promise((resolve, reject) => {
        router.on('PUT', '/a', (req, res, next) => 
            resolve({ req, res, next })
          )
          .on('GET', '/a', (req, res, next) => 
            reject({ req, res, next })
          );
      }).then(({ req, res, next }) => {
        res.end();
        assert.ok(true);
      }).catch(({ req, res, next }) => {
        res.end();
        assert.ok(false);
      });
      
      request.put('http://localhost:8080/a');
      
      return p;
    });

    it('should run after the middleware delegates itself', function() {
      const p = new Promise((resolve, reject) => {
        router.use(async(req, res, next) => { 
            await next(); 
            reject({ req, res, next });
          })
          .on('GET', '/a', (req, res, next) => 
            resolve({ req, res, next })
          );
      }).then(({ req, res, next }) => {
        res.end();
        assert.ok(true);
      }).catch(({ req, res, next }) => {
        res.end();
        assert.ok(false);
      });
      
      request.get('http://localhost:8080/a');
      
      return p;
    });
  });

  describe('#use', function() {
    it('should run in chronological order', function() {
      const p = new Promise((resolve, reject) => {
        router.use((req, res, next) => 
            resolve({ req, res, next })
          )
          .use((req, res, next) => 
            reject({ req, res, next })
          );
      }).then(({ req, res, next }) => {
        res.end();
        assert.ok(true);
      }).catch(({ req, res, next }) => {
        res.end();
        assert.ok(false);
      });
      
      request.get('http://localhost:8080/a');
      
      return p;
    });

    it('should run before the handler', function() {
      const p = new Promise((resolve, reject) => {
        router.use((req, res, next) => 
            resolve({ req, res, next })
          )
          .on('GET', '/a', (req, res, next) => 
            reject({ req, res, next })
          );
      }).then(({ req, res, next }) => {
        res.end();
        assert.ok(true);
      }).catch(({ req, res, next }) => {
        res.end();
        assert.ok(false);
      });
      
      request.get('http://localhost:8080/a');
      
      return p;
    });

    it('should resume after the handler delegates itself', function() {
      const p = new Promise((resolve, reject) => {
        router.use(async(req, res, next) => {
            await next();
            resolve({ req, res, next });
          })
          .on('GET', '/a', (req, res, next) => 
            next()
          );
      }).then(({ req, res, next }) => {
        res.end();
        assert.ok(true);
      }).catch(({ req, res, next }) => {
        res.end();
        assert.ok(false);
      });
      
      request.get('http://localhost:8080/a');
      
      return p;
    });
  });
});

describe('Request', function() {
  describe('#params', function() {
    it('should correctly deserialize a query string with encoding', function() {
      const p = new Promise((resolve, reject) => {
        router.on('GET', '/a', (req, res, next) => 
          resolve({ req, res, next })
        );
      }).then(({ req, res, next }) => {
        res.end();
        assert.equal(req.getParams().b, 'c d');
      });
      
      request.get('http://localhost:8080/a?b=c%20d');
      
      return p;
    });

    it('should return the same data if called multiple times', function() {
      const p = new Promise((resolve, reject) => {
        router.on('GET', '/a', (req, res, next) => 
          resolve({ req, res, next })
        );
      }).then(({ req, res, next }) => {
        res.end();
        assert.equal(req.getParams().b, req.getParams().b);
      });
      
      request.get('http://localhost:8080/a?b=c%20d');
      
      return p;
    })
  });

  describe('#bodyAsync', function() {
    it('should correctly parse the request body', function() {
      const p = new Promise((resolve, reject) => {
        router.on('GET', '/a', (req, res, next) => 
          resolve({ req, res, next })
        );
      }).then(async({ req, res, next }) => {
        res.end();
        assert.equal((await req.getBodyAsync()).b, 'c d');
      });
      
      request.get('http://localhost:8080/a', { data: { b: 'c d' } });
      
      return p;
    });

    it('should return the same data if called multiple times', function() {
      const p = new Promise((resolve, reject) => {
        router.on('GET', '/a', (req, res, next) => 
          resolve({ req, res, next })
        );
      }).then(async({ req, res, next }) => {
        res.end();
        assert.equal((await req.getBodyAsync()).b, (await req.getBodyAsync()).b);
      });
      
      request.get('http://localhost:8080/a', { data: { b: 'c d' } });
      
      return p;
    });
  });
});