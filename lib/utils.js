'use strict';

const getRoute = url => url.split('?')[0];
const getParams = url => url.split('?')[1];

module.exports = { getRoute, getParams, };