#!/usr/bin/env node

const cdk = require("@aws-cdk/core");
const { SwarmBasicCluster } = require("../components/SwarmBasicCluster");

const app = new cdk.App();

const extraParams = JSON.parse(process.env.EXTRA_PARAMS);

new SwarmBasicCluster(
  app,
  extraParams.stackName,
  JSON.parse(process.env.EXTRA_PARAMS)
);
