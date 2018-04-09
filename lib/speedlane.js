'use strict';

const http = require('http');

const utils = require('./utils');
const { Request, Response, } = require('./prototypes');

class Speedlane {
  constructor() {
    this._routes = new Map(http.METHODS.map(n => [n, new Map()]));
    this._middleware = [];
  }

  get callback() {
    return this._request.bind(this);
  }
  
  on(method, path, cb) {
    this._routes
      .get(method)
      .set(path, cb);
    return this;
  }
  
  use(cb) {
    this._middleware.unshift(cb);
    return this;
  }

  _request(req, res) {
    const cbs = Object.create(this._middleware);
    const route = this._routes
      .get(req.method)
      .get(utils.getRoute(req.url));
        
    if(route)
      cbs.unshift(route);
    
    this._next(cbs, req, res);
  }

  _next(cbs, req, res) {
    (async function next() {
      if(cbs.length)
        await cbs.pop()(req, res, next);
    })();
  }
}

module.exports = { Speedlane, Request, Response, };