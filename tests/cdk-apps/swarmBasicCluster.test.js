const { haveResource, haveOutput, SynthUtils } = require("@aws-cdk/assert");
const cdk = require("@aws-cdk/core");

const expectCdk = require("@aws-cdk/assert").expect;

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
            "Fn::GetAtt": ["manager", "GroupId"],
          },
        ],
      },
    },
  });

  expect(userDataStringified).toEqual(
    expect.stringContaining("{id:setupNodeManagerCreationControl}")
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
