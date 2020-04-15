#!/usr/bin/env node

const cdk = require("@aws-cdk/core");
const { EmptyCdkApp } = require("../lib/emptyApp");

const app = new cdk.App();

const extraParams = JSON.parse(process.env.EXTRA_PARAMS);

new EmptyCdkApp(app, extraParams.stackName, extraParams);
