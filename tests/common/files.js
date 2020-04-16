const fs = require("fs");

const lambdaTriggerFile = fs.readFileSync(
  `${__dirname}/../../src/cdkBuilder/components/SwarmBasicCluster/manager/LambdaTriggers/afterAutoscalingWasNotified.js`
);

module.exports = {
  swarmBasicCluster: {
    manager: {
      lambdaTriggerFile,
    },
  },
};
