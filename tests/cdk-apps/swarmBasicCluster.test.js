const { haveResource, haveOutput, SynthUtils } = require("@aws-cdk/assert");
const cdk = require("@aws-cdk/core");

const expectCdk = require("@aws-cdk/assert").expect;

const {
  SwarmBasicCluster,
} = require("../../src/cdkBuilder/components/SwarmBasicCluster");

test("SwarmBasicCluster created", () => {
  const app = new cdk.App({
    outdir: "./cdk.swarmBasicCluster.out",
  });

  const swarmBasicCluster = new SwarmBasicCluster(app, "swarmBasicCluster", {
    defaultAmi: "ami-02754f8fca803b3a8",
    credentials: {
      aws_secret_access_key: "AKIAWCMCEPMLRAL4TPNJ",
      aws_access_key_id: "mNu/IjZFyshmEH+3j/11zFeZVfuvKYYLp0WF48dg",
      aws_region: "us-east-1",
    },
    description: "Swarm Basic Cluster",
    stackName: "cfstackABCD-swarmBasicCluster",
  });

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
      GroupName: "swarm-manager-sg-swarmBasicCluster",
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
      LaunchTemplateName: "swarm-node-manager-launchtemplate-swarmBasicCluster",
    })
  );

  expect(
    expectCdk(swarmBasicCluster).value.Resources.managerLaunchTemplate
  ).toMatchObject({
    Properties: {
      LaunchTemplateName: "swarm-node-manager-launchtemplate-swarmBasicCluster",
      LaunchTemplateData: {
        CapacityReservationSpecification: {
          CapacityReservationPreference: "open",
        },
        CreditSpecification: {
          CpuCredits: "standard",
        },
        DisableApiTermination: false,
        EbsOptimized: false,
        ImageId: "ami-02754f8fca803b3a8",
        InstanceInitiatedShutdownBehavior: "terminate",
        InstanceType: "t3a.micro",
        KeyName: "wordpress-ops-host-keypair-2020-03-11",
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

  expectCdk(swarmBasicCluster).to(
    haveOutput({
      exportName: "managerVpcId",
    })
  );

  // expectCdk(swarmBasicCluster).to(
  //   haveOutput({
  //     exportName: "rootOperatorIamAccessKey",
  //   })
  // );
});
