const { CdkDeployParams } = require("../../src/common/CdkDeployParams");
const { callCdkDeploySync } = require("../../src/common/cdkDeployCommand");
const { CdkDestroyParams } = require("../../src/common/CdkDestroyParams");
const { callCdkDestroySync } = require("../../src/common/cdkDestroyCommand");

const randomString = require("randomstring");

beforeEach(async () => {
  jest.setTimeout(900000);
});

const {
  appName,
  stackName,
  deploymentOperator,
  awsRegion,
  rndStr,
} = require("../common/variables").emptyApp;

test("EmptyApp - call cdkDeploy without errors", async () => {
  const response = await callCdkDeploySync(
    new CdkDeployParams(
      appName,
      awsRegion,
      deploymentOperator.awsAccessKeyId,
      deploymentOperator.awsSecretAccessKey,
      {
        stackName,
        rndStr,
      }
    )
  );

  expect(response.error).toBeUndefined();
});

test("EmptyApp - call cdkDestroy without errors", async () => {
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
