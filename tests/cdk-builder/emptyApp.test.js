const { CdkDeployParams } = require("../../src/common/CdkDeployParams");
const { callCdkDeploySync } = require("../../src/common/cdkDeployCommand");
const { CdkDestroyParams } = require("../../src/common/CdkDestroyParams");
const { callCdkDestroySync } = require("../../src/common/cdkDestroyCommand");

const randomString = require("randomstring");

beforeEach(async () => {
  jest.setTimeout(900000);
});

let awsAccessKeyId = null,
  awsSecretAccessKey = null,
  awsRegion = null,
  stackName = null,
  appName = null;

if (process.env.NODE_ENV === "test") {
  let rndStr = randomString.generate({
    length: 5,
    charset: "alphabetic",
  });

  awsRegion = process.env.AWS_REGION;
  awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
  awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  stackName = `cfstack-${rndStr}-emptyAppTest`;
  appName = "emptyApp";
}

test("EmptyApp - call cdkDeploy without errors", async () => {
  const response = await callCdkDeploySync(
    new CdkDeployParams(
      appName,
      awsRegion,
      awsAccessKeyId,
      awsSecretAccessKey,
      {
        stackName,
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
      awsAccessKeyId,
      awsSecretAccessKey,
      {
        stackName,
      }
    )
  );

  expect(response.error).toBeUndefined();
});
