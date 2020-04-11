const { CdkDeployParams } = require("../common/CdkDeployParams");
const { callCdkDeploySync } = require("../common/cdkDeployCommand");

module.exports.handler = async (event) => {
  const response = await callCdkDeploySync(
    new CdkDeployParams("emptyApp", "us-east-1", {
      test: {
        message: "hello, world!",
      },
    })
  );

  return { response };
};
