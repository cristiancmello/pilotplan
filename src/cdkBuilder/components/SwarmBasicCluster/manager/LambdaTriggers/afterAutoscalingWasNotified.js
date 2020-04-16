"use strict";

const AWS = require("aws-sdk");
const SSM = new AWS.SSM();

module.exports.handler = async (event) => {
  const snsMessage = JSON.parse(event.Records[0].Sns.Message);
  const instanceId = snsMessage.EC2InstanceId;
  const autoScalingEvent = snsMessage.Event;

  if (autoScalingEvent === "autoscaling:EC2_INSTANCE_TERMINATE") {
    const stackName = process.env.STACK_NAME;

    const deleteResult = await SSM.deleteParameters({
      Names: [
        `/${stackName}/swarmCluster/managers/${instanceId}/jointoken/as/worker`,
        `/${stackName}/swarmCluster/managers/${instanceId}/ipv4`,
        `/${stackName}/swarmCluster/managers/leader/instanceId`,
      ],
    }).promise();

    console.log(deleteResult);
  }

  return {};
};
