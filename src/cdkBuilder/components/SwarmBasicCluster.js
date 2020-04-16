const cdk = require("@aws-cdk/core");
const fs = require("fs");

const {
  Vpc,
  CfnSecurityGroup,
  SubnetType,
  CfnLaunchTemplate,
} = require("@aws-cdk/aws-ec2");

const autoscaling = require("@aws-cdk/aws-autoscaling");
const iam = require("@aws-cdk/aws-iam");
const sns = require("@aws-cdk/aws-sns");
const lambda = require("@aws-cdk/aws-lambda");
const subs = require("@aws-cdk/aws-sns-subscriptions");

const { Stack } = require("../components/base/Stack");

const {
  ManagerEntrypointFile,
} = require("./SwarmBasicCluster/manager/EntrypointFile");

/**
 *
 * @param {cdk.Construct} scope
 * @param {string} id
 * @param {cdk.StackProps=} props
 */
class SwarmBasicCluster extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    this.createResources(id, props);
  }

  createResources = (id, props) => {
    this.rootUserOperator(props);
    this.defaultVpc(props);
    this.managerSecurityGroup();
    this.managerLaunchTemplate(props);
    this.managerAutoScalingGroup(props);
  };

  rootUserOperator = (props) => {
    const create = this.setConfig(iam.CfnUser, "rootUserOperator", {
      userName: `root.ops.${props.rndStr}`,
      policies: [
        {
          policyName: "AdministratorAccess",
          policyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: "*",
                Resource: "*",
              },
            ],
          },
        },
      ],
    });

    this.createAccessKey = this.setConfig(
      iam.CfnAccessKey,
      "rootUserOperatorAccessKey"
    );

    this.rootUserOperatorCreated = create();

    this.createdAccessKey = this.createAccessKey({
      userName: this.rootUserOperatorCreated.ref,
    });

    const createAccessKeyOutput = this.setConfig(
      cdk.CfnOutput,
      "rootUserOperatorAccessKeyOutput"
    );

    const createSecretKeyOutput = this.setConfig(
      cdk.CfnOutput,
      "rootUserOperatorSecretKeyOutput"
    );

    createAccessKeyOutput({
      exportName: `${props.rndStr}-rootUserOperatorAccessKey`,
      value: this.createdAccessKey.ref,
    });

    createSecretKeyOutput({
      exportName: `${props.rndStr}-rootUserOperatorSecretKey`,
      value: this.createdAccessKey.attrSecretAccessKey,
    });
  };

  defaultVpc = (props) => {
    const create = this.setConfig(Vpc, "default", {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 26,
          name: "publicSubnet",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 26,
          name: "databaseSubnet",
          subnetType: SubnetType.ISOLATED,
        },
      ],
    });

    const createVpcOutput = this.setConfig(cdk.CfnOutput, "vpc");

    this.createdDefaultVpc = create();

    createVpcOutput({
      exportName: `${props.rndStr}-vpcId`,
      value: this.createdDefaultVpc.vpcId,
    });
  };

  managerSecurityGroup = () => {
    const create = this.setConfig(CfnSecurityGroup, "managerSecurityGroup", {
      groupName: `swarm-manager-sg-${this.stackName}`,
      groupDescription: "Docker Swarm Manager SG",
      securityGroupIngress: [
        {
          ipProtocol: "-1",
          fromPort: 0,
          toPort: 65535,
          cidrIp: "0.0.0.0/0",
        },
      ],
      vpcId: this.createdDefaultVpc.vpcId,
    });

    this.createdManagerSecurityGroup = create();
  };

  managerLaunchTemplate = (props) => {
    const create = this.setConfig(CfnLaunchTemplate, "managerLaunchTemplate", {
      launchTemplateName: `swarm-node-manager-launchtemplate-${this.stackName}`,
      launchTemplateData: {
        capacityReservationSpecification: {
          capacityReservationPreference: "open",
        },
        creditSpecification: {
          cpuCredits: "standard",
        },
        disableApiTermination: false,
        ebsOptimized: false,
        imageId: props.defaultAmi,
        instanceInitiatedShutdownBehavior: "terminate",
        instanceType: "t3a.micro",
        keyName: props.keyPairName,
        monitoring: {
          enabled: false,
        },
        userData: cdk.Fn.base64(
          ManagerEntrypointFile(
            this.stackName,
            {
              aws_access_key_id: this.createdAccessKey.ref,
              aws_secret_access_key: this.createdAccessKey.attrSecretAccessKey,
              aws_region: this.region,
            },
            props.manager
          )
        ),
        securityGroupIds: [this.createdManagerSecurityGroup.attrGroupId],
      },
    });

    this.createdManagerLaunchTemplate = create();
  };

  managerAutoScalingGroup = (props) => {
    this.createManagerAutoscalingNotificationTopic = this.setConfig(
      sns.Topic,
      "managerAutoscalingNotificationTopic",
      {
        displayName: "managerAutoscalingNotificationTopic",
      }
    );

    this.createdManagerAutoscalingNotificationTopic = this.createManagerAutoscalingNotificationTopic();

    const lambdaTriggerFile = fs.readFileSync(
      `${__dirname}/SwarmBasicCluster/manager/LambdaTriggers/afterAutoscalingWasNotified.js`
    );

    this.createManagerLambdaTriggerAfterAsgWasNotified = this.setConfig(
      lambda.Function,
      "managerLambdaTriggerAfterAsgWasNotified",
      {
        runtime: lambda.Runtime.NODEJS_12_X,
        code: lambda.Code.fromInline(lambdaTriggerFile.toString()),
        handler: "index.handler",
        timeout: cdk.Duration.seconds(900),
        memorySize: 512,
      }
    );

    this.createdManagerLambdaTriggerAfterAsgWasNotified = this.createManagerLambdaTriggerAfterAsgWasNotified();

    this.createdManagerLambdaTriggerAfterAsgWasNotified.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["*"],
        resources: ["*"],
      })
    );

    this.createdManagerAutoscalingNotificationTopic.addSubscription(
      new subs.LambdaSubscription(
        this.createdManagerLambdaTriggerAfterAsgWasNotified
      )
    );

    const selection = this.createdDefaultVpc.selectSubnets({
      subnetType: SubnetType.PUBLIC,
    });

    this.createManagerAsg = this.setConfig(
      autoscaling.CfnAutoScalingGroup,
      "managerAutoScaling",
      {
        desiredCapacity: "0",
        minSize: "0",
        maxSize: "0",
        launchTemplate: {
          launchTemplateId: this.createdManagerLaunchTemplate.ref,
          version: this.createdManagerLaunchTemplate.attrLatestVersionNumber,
        },
        notificationConfigurations: [
          {
            notificationTypes: [
              "autoscaling:EC2_INSTANCE_LAUNCH",
              "autoscaling:EC2_INSTANCE_LAUNCH_ERROR",
              "autoscaling:EC2_INSTANCE_TERMINATE",
              "autoscaling:EC2_INSTANCE_TERMINATE_ERROR",
            ],
            topicArn: this.createdManagerAutoscalingNotificationTopic.topicArn,
          },
        ],
        vpcZoneIdentifier: selection.subnetIds,
        tags: [
          {
            key: "Application",
            value: `swarm-node-${props.stackName}`,
            propagateAtLaunch: true,
          },
          {
            key: "Environment",
            value: "production",
            propagateAtLaunch: true,
          },
          {
            key: "SwarmRole",
            value: "manager",
            propagateAtLaunch: true,
          },
        ],
      }
    );

    this.createdManagerAsg = this.createManagerAsg();
  };
}

module.exports = {
  SwarmBasicCluster,
};
