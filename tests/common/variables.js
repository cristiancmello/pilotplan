const randomString = require("randomstring");

const generalVars = () => {
  if (process.env.NODE_ENV === "test") {
    rndStr = randomString.generate({
      length: 5,
      charset: "alphabetic",
    });

    awsRegion = process.env.AWS_REGION;
    awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  }

  return {
    deploymentOperator: {
      awsAccessKeyId,
      awsSecretAccessKey,
    },
    awsRegion,
    rndStr,
  };
};

const swarmBasicClusterVars = () => {
  const { deploymentOperator, awsRegion, rndStr } = generalVars();

  return {
    deploymentOperator,
    stackName: `cfstack-${rndStr}-swarmBasicClusterTest`,
    appName: "swarmBasicCluster",
    awsRegion,
    defaultAmi: process.env.AWS_AMI_DEFAULT,
    keyPairName: process.env.DEFAULT_KEYPAIR_NAME,
    rndStr,
  };
};

const emptyAppVars = () => {
  return {
    ...generalVars(),
    appName: "emptyApp",
    stackName: `cfstack-${rndStr}-emptyApp`,
  };
};

module.exports = {
  emptyApp: emptyAppVars(),
  swarmBasicCluster: swarmBasicClusterVars(),
};
