"use strict";

const fs = require("fs");

const ManagerEntrypointFile = (stackName, credentials, setup = {}) => {
  let installPortainerScriptString = "";

  let swarmNodeManagerEntrypointFile = fs.readFileSync(
    `${__dirname}/EntrypointFiles/nodeManagerEntrypoint.sh`
  );

  let swarmNodeManagerEntrypointFileString = swarmNodeManagerEntrypointFile.toString();

  if (setup.installPortainer) {
    installPortainerScriptString = installPortainerScript();
  }

  const rexrayCredentials = {
    ebs: {
      aws_region: credentials.aws_region,
      aws_access_key_id: credentials.aws_access_key_id,
      aws_secret_access_key: credentials.aws_secret_access_key,
    },
    s3fs: {
      aws_access_key_id: credentials.aws_access_key_id,
      aws_secret_access_key: credentials.aws_secret_access_key,
    },
    efs: {
      aws_access_key_id: credentials.aws_access_key_id,
      aws_secret_access_key: credentials.aws_secret_access_key,
    },
  };

  return `
${swarmNodeManagerEntrypointFileString}
${setupRexrayPlugin(rexrayCredentials)}
${installPortainerScriptString}
${setupNodeManagerCreationControl(stackName, credentials)}
`;
};

const setupRexrayPlugin = (rexrayCredentials) => {
  return `
# {id:setupRexrayPlugin}
# Setup Rexray Plugin
export EBS_REGION=${rexrayCredentials.ebs.aws_region}
export EBS_ACCESSKEY=${rexrayCredentials.ebs.aws_access_key_id}
export EBS_SECRETKEY=${rexrayCredentials.ebs.aws_secret_access_key}

export S3FS_ACCESSKEY=${rexrayCredentials.s3fs.aws_access_key_id}
export S3FS_SECRETKEY=${rexrayCredentials.s3fs.aws_secret_access_key}

export EFS_ACCESSKEY=${rexrayCredentials.efs.aws_access_key_id}
export EFS_SECRETKEY=${rexrayCredentials.efs.aws_secret_access_key}

sudo sh -c "cat << EOF >> /etc/rexray/config.yml
libstorage:
  service: ebs
  server:
    services:
      ebs:
        driver: ebs
      s3fs:
        driver: s3fs
      efs:
        driver: efs
EOF"

sudo systemctl start rexray
sleep 3

docker plugin install rexray/ebs \
    REXRAY_PREEMPT=true \
    EBS_REGION=$EBS_REGION \
    EBS_ACCESSKEY=$EBS_ACCESSKEY \
    EBS_SECRETKEY=$EBS_SECRETKEY \
    --grant-all-permissions

docker plugin install rexray/s3fs \
    S3FS_ACCESSKEY=$S3FS_ACCESSKEY \
    S3FS_SECRETKEY=$S3FS_SECRETKEY \
    --grant-all-permissions

docker plugin install rexray/efs \
    EFS_ACCESSKEY=$EFS_ACCESSKEY \
    EFS_SECRETKEY=$EFS_SECRETKEY \
    EFS_TAG=rexray \
    --grant-all-permissions
`;
};

const setupNodeManagerCreationControl = (stackName, credentials) => {
  return `
# {id:setupNodeManagerCreationControl}
export AWS_ACCESS_KEY_ID=${credentials.aws_access_key_id}
export AWS_SECRET_ACCESS_KEY=${credentials.aws_secret_access_key}
export AWS_DEFAULT_REGION=${credentials.aws_region}

DOCKER_SWARM_JOINTOKEN_WORKER=$(docker swarm join-token worker --quiet)
EC2_INSTANCE_LOCAL_IPV4=$(curl http://169.254.169.254/latest/meta-data/local-ipv4)
DOCKER_SWARM_MANAGER_INSTANCE_ID=$(curl http://169.254.169.254/latest/meta-data/instance-id)

aws ssm put-parameter \
  --name "/${stackName}/swarmCluster/managers/$DOCKER_SWARM_MANAGER_INSTANCE_ID/jointoken/as/worker" \
  --value "$DOCKER_SWARM_JOINTOKEN_WORKER" \
  --type "String" \
  --tier Standard \
  --overwrite

aws ssm put-parameter \
  --name "/${stackName}/swarmCluster/managers/$DOCKER_SWARM_MANAGER_INSTANCE_ID/ipv4" \
  --value "$EC2_INSTANCE_LOCAL_IPV4" \
  --type "String" \
  --tier Standard \
  --overwrite

aws ssm put-parameter \
  --name "/${stackName}/swarmCluster/managers/leader/instanceId" \
  --value "$DOCKER_SWARM_MANAGER_INSTANCE_ID" \
  --type "String" \
  --tier Standard \
  --overwrite
`;
};

const installPortainerScript = () => {
  return `
# {id:portainerInstallation}
# Installing Portainer Server and Agent
INSTANCE_PUBLIC_DNS=$(curl http://169.254.169.254/latest/meta-data/public-hostname)

curl -L https://downloads.portainer.io/portainer-agent-stack.yml -o portainer-agent-stack.yml
docker stack deploy --compose-file=portainer-agent-stack.yml portainer

BEARER_TOKEN=$(curl -X POST localhost:9000/api/auth -d "{\"Username\": \"admin\", \"Password\": \"12345678\"}" | jq -r '.jwt')

curl -v -X PUT localhost:9000/api/endpoints/1 \
    -d "{\"PublicURL\": \"\${INSTANCE_PUBLIC_DNS}\"}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BEARER_TOKEN" | jq . \
    >> output.txt
`;
};

module.exports = {
  ManagerEntrypointFile,
};
