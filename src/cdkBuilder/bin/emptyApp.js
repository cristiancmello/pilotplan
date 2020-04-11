#!/usr/bin/env node

const cdk = require("@aws-cdk/core");
const { EmptyCdkApp } = require("../lib/emptyApp");

const app = new cdk.App();
new EmptyCdkApp(app, "EmptyCdkApp");
