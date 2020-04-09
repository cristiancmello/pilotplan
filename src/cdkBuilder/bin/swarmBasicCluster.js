#!/usr/bin/env node

const cdk = require("@aws-cdk/core");
const { CdkSampleAppStack } = require("../lib/swarmBasicCluster");

const app = new cdk.App();
new CdkSampleAppStack(app, "CdkSampleAppStack");
