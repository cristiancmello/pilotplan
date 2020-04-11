#!/usr/bin/env node

const cdk = require("@aws-cdk/core");
const { EmptyCdkApp } = require("../lib/emptyApp");

const app = new cdk.App();
new EmptyCdkApp(app, "EmptyCdkApp");

console.log('EXTRA_PARAMS', process.env.EXTRA_PARAMS)