const { CdkDeployParams } = require("../../src/common/CdkDeployParams");
const { callCdkDeploySync } = require("../../src/common/cdkDeployCommand");
const { CdkDestroyParams } = require("../../src/common/CdkDestroyParams");
const { callCdkDestroySync } = require("../../src/common/cdkDestroyCommand");

beforeEach(async () => {
  jest.setTimeout(900000);
});

const {
  defaultAmi,
  appName,
  stackName,
  keyPairName,
  deploymentOperator,
  awsRegion,
  rndStr,
} = require("../common/variables").swarmBasicCluster;

test("SwarmBasicCluster - call cdkDeploy without errors", async () => {
  const response = await callCdkDeploySync(
    new CdkDeployParams(
      appName,
      awsRegion,
      deploymentOperator.awsAccessKeyId,
      deploymentOperator.awsSecretAccessKey,
      {
        defaultAmi,
        stackName,
        keyPairName,
        rndStr,
      }
    )
  );

  expect(response.error).toBeUndefined();
});

test("SwarmBasicCluster - call cdkDestroy without errors", async () => {
  const response = await callCdkDestroySync(
    new CdkDestroyParams(
      appName,
      awsRegion,
      deploymentOperator.awsAccessKeyId,
      deploymentOperator.awsSecretAccessKey,
      {
        stackName,
      }
    )
  );

  expect(response.error).toBeUndefined();
});
