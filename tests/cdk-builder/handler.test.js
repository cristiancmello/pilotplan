const AWS = require('aws-sdk')

const lambda = new AWS.Lambda({
  region: 'us-east-1'
});

const callCdkDeployLambda = params => {
  return lambda.invokeAsync(params).promise();
};

test("correct default node_env", async () => {
  expect(process.env.NODE_ENV).toBe("test");

  await callCdkDeployLambda({
    FunctionName: 'serverless-pilotplan-development-cdkDeploy',
    InvokeArgs: Buffer.from(JSON.stringify({}))
  })
});
