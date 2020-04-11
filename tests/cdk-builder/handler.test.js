const AWS = require("aws-sdk");

const lambda = new AWS.Lambda({
  region: "us-east-1",
});

const callCdkDeployLambda = (params) => {
  return lambda.invokeAsync(params).promise();
};

test("call cdkDeploy without errors", async () => {
  expect(process.env.NODE_ENV).toBe("test");

  const response = await callCdkDeployLambda({
    FunctionName: `serverless-pilotplan-development-cdkDeploy`,
    InvokeArgs: Buffer.from(JSON.stringify({})),
  });

  console.log(response);
});
