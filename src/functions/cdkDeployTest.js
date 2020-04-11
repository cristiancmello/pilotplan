const AWS = require("aws-sdk");
const lambda = new AWS.Lambda({
  endpoint: "http://localhost:3000",
});

module.exports.handler = async (event) => {
  const response = await lambda
    .invokeAsync({
      FunctionName: "cdkDeploy",
      InvokeArgs: JSON.stringify({}),
    })
    .promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      output: response,
    }),
  };
};
