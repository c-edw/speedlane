'use strict';

const http = require('http');
const qs = require('querystring');

const utils = require('./utils');

const Request = http.IncomingMessage.prototype;
const Response = http.ServerResponse.prototype;

Request.getParams = function() {
  if(!this._params)
    this._params = qs.parse(utils.getParams(this.url));
   
  return this._params;
};

Request.getBodyAsync = function() {
  if(!this._body) 
    this._body = new Promise((resolve, reject) => {
      this
        .on('data', c => resolve(JSON.parse(c.toString())))
        .on('end', () => resolve({}))
    });
  
  return this._body;
};

module.exports = { Request, Response, };