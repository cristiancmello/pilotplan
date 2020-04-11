const AWS = require("aws-sdk");

const { CdkDeployParams } = require("../../src/common/CdkDeployParams");
const { callCdkDeploySync } = require("../../src/common/cdkDeployCommand");
const { CdkDestroyParams } = require("../../src/common/CdkDestroyParams");
const { callCdkDestroySync } = require("../../src/common/cdkDestroyCommand");

beforeEach(async () => {
  jest.setTimeout(90000);
});

test("call cdkDeploy without errors", async () => {
  let awsAccessKeyId = null,
    awsSecretAccessKey = null;

  if (process.env.NODE_ENV === "test") {
    awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  }

  const response = await callCdkDeploySync(
    new CdkDeployParams(
      "emptyApp",
      "us-east-1",
      {
        test: {
          message: "hello, world!",
        },
      },
      awsAccessKeyId,
      awsSecretAccessKey
    )
  );

  expect(response.error).toBeUndefined();
});

test("call cdkDestroy without errors", async () => {
  let awsAccessKeyId = null,
    awsSecretAccessKey = null;

  if (process.env.NODE_ENV === "test") {
    awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  }

  const response = await callCdkDestroySync(
    new CdkDeployParams(
      "emptyApp",
      "us-east-1",
      {
        test: {
          message: "hello, world!",
        },
      },
      awsAccessKeyId,
      awsSecretAccessKey
    )
  );

  expect(response.error).toBeUndefined();
});
