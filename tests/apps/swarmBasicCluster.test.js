const {
  haveResource,
  haveOutput,
  SynthUtils,
  beASupersetOfTemplate,
  exactlyMatchTemplate,
  matchTemplate,
} = require("@aws-cdk/assert");

const cdk = require("@aws-cdk/core");

const expectCdk = require("@aws-cdk/assert").expect;

const commonFiles = require("../common/files");

const {
  SwarmBasicCluster,
} = require("../../src/cdkBuilder/components/SwarmBasicCluster");

const {
  defaultAmi,
  appName,
  keyPairName,
  rndStr,
} = require("../common/variables").swarmBasicCluster;

const createCdkApp = () => {
  return new cdk.App({
    outdir: "./cdk.swarmBasicCluster.out",
  });
};

test("SwarmBasicCluster created without errors", () => {
  const app = createCdkApp();
  const stackName = "createdWithoutErrors";

  const swarmBasicCluster = new SwarmBasicCluster(app, appName, {
    defaultAmi,
    stackName,
    keyPairName,
    rndStr,
  });

  const managerLaunchTemplateTemplate = expectCdk(swarmBasicCluster).value
    .Resources.managerLaunchTemplate;

  const userDataStringified = JSON.stringify(
    managerLaunchTemplateTemplate.Properties.LaunchTemplateData.UserData
  );

  expectCdk(swarmBasicCluster).to(
    haveResource("AWS::EC2::VPC", {
      CidrBlock: "10.0.0.0/16",
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
    })
  );

  expectCdk(swarmBasicCluster).to(
    haveResource("AWS::EC2::SecurityGroup", {
      GroupDescription: "Docker Swarm Manager SG",
      GroupName: `swarm-manager-sg-${stackName}`,
      SecurityGroupIngress: [
        {
          CidrIp: "0.0.0.0/0",
          FromPort: 0,
          IpProtocol: "-1",
          ToPort: 65535,
        },
      ],
      VpcId: {
        Ref: "defaultC974F9E3",
      },
    })
  );

  expectCdk(swarmBasicCluster).to(
    haveResource("AWS::EC2::LaunchTemplate", {
      LaunchTemplateName: `swarm-node-manager-launchtemplate-${stackName}`,
    })
  );

  expect(
    expectCdk(swarmBasicCluster).value.Resources.managerLaunchTemplate
  ).toMatchObject({
    Properties: {
      LaunchTemplateData: {
        CapacityReservationSpecification: {
          CapacityReservationPreference: "open",
        },
        CreditSpecification: {
          CpuCredits: "standard",
        },
        DisableApiTermination: false,
        EbsOptimized: false,
        ImageId: defaultAmi,
        InstanceInitiatedShutdownBehavior: "terminate",
        InstanceType: "t3a.micro",
        KeyName: keyPairName,
        Monitoring: {
          Enabled: false,
        },
        SecurityGroupIds: [
          {
            "Fn::GetAtt": ["managerSecurityGroup", "GroupId"],
          },
        ],
      },
    },
  });

  expect(userDataStringified).toEqual(
    expect.stringContaining("{id:setupNodeManagerCreationControl}")
  );

  expectCdk(swarmBasicCluster).to(
    haveResource("AWS::SNS::Topic", {
      DisplayName: "managerAutoscalingNotificationTopic",
    })
  );

  expectCdk(swarmBasicCluster).to(
    haveResource("AWS::Lambda::Function", {
      Handler: "index.handler",
      Role: {
        "Fn::GetAtt": [
          "managerLambdaTriggerAfterAsgWasNotifiedServiceRole52DEEF81",
          "Arn",
        ],
      },
      Code: {
        ZipFile: commonFiles.swarmBasicCluster.manager.lambdaTriggerFile.toString(),
      },
      Runtime: "nodejs12.x",
      MemorySize: 512,
      Timeout: 900,
    })
  );

  expectCdk(swarmBasicCluster).to(
    haveResource("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: [
          {
            Action: "*",
            Effect: "Allow",
            Resource: "*",
          },
        ],
        Version: "2012-10-17",
      },
      PolicyName:
        "managerLambdaTriggerAfterAsgWasNotifiedServiceRoleDefaultPolicyA4D06CDE",
      Roles: [
        {
          Ref: "managerLambdaTriggerAfterAsgWasNotifiedServiceRole52DEEF81",
        },
      ],
    })
  );

  expectCdk(swarmBasicCluster).to(
    haveResource("AWS::SNS::Subscription", {
      Protocol: "lambda",
      TopicArn: {
        Ref: "managerAutoscalingNotificationTopic00838E3D",
      },
      Endpoint: {
        "Fn::GetAtt": [
          "managerLambdaTriggerAfterAsgWasNotified88F5D369",
          "Arn",
        ],
      },
    })
  );

  expectCdk(swarmBasicCluster).to(
    haveResource("AWS::AutoScaling::AutoScalingGroup", {
      MaxSize: "0",
      MinSize: "0",
      DesiredCapacity: "0",
      LaunchTemplate: {
        LaunchTemplateId: {
          Ref: "managerLaunchTemplate",
        },
        Version: {
          "Fn::GetAtt": ["managerLaunchTemplate", "LatestVersionNumber"],
        },
      },
      NotificationConfigurations: [
        {
          NotificationTypes: [
            "autoscaling:EC2_INSTANCE_LAUNCH",
            "autoscaling:EC2_INSTANCE_LAUNCH_ERROR",
            "autoscaling:EC2_INSTANCE_TERMINATE",
            "autoscaling:EC2_INSTANCE_TERMINATE_ERROR",
          ],
          TopicARN: {
            Ref: "managerAutoscalingNotificationTopic00838E3D",
          },
        },
      ],
      Tags: [
        {
          Key: "Application",
          PropagateAtLaunch: true,
          Value: "swarm-node-createdWithoutErrors",
        },
        {
          Key: "Environment",
          PropagateAtLaunch: true,
          Value: "production",
        },
        {
          Key: "SwarmRole",
          PropagateAtLaunch: true,
          Value: "manager",
        },
      ],
      VPCZoneIdentifier: [
        {
          Ref: "defaultpublicSubnetSubnet1SubnetAB14372C",
        },
        {
          Ref: "defaultpublicSubnetSubnet2Subnet211EA22D",
        },
      ],
    })
  );

  expectCdk(swarmBasicCluster).to(
    haveOutput({
      exportName: `${rndStr}-vpcId`,
    })
  );

  expectCdk(swarmBasicCluster).to(
    haveOutput({
      exportName: `${rndStr}-rootUserOperatorAccessKey`,
    })
  );

  expectCdk(swarmBasicCluster).to(
    haveOutput({
      exportName: `${rndStr}-rootUserOperatorSecretKey`,
    })
  );
});

test("SwarmBasicCluster created with Portainer as manager of Docker Swarm Manager Node", () => {
  const app = createCdkApp();
  const stackName = "createdWithPortainer";

  const swarmBasicCluster = new SwarmBasicCluster(app, appName, {
    defaultAmi,
    stackName,
    keyPairName,
    rndStr,
    manager: {
      installPortainer: true,
    },
  });

  const managerLaunchTemplateTemplate = expectCdk(swarmBasicCluster).value
    .Resources.managerLaunchTemplate;

  const userDataStringified = JSON.stringify(
    managerLaunchTemplateTemplate.Properties.LaunchTemplateData.UserData
  );

  expect(userDataStringified).toEqual(
    expect.stringContaining("{id:portainerInstallation}")
  );
});
