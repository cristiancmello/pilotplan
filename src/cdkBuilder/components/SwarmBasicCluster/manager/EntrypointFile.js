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

  return `
${swarmNodeManagerEntrypointFileString}
${installPortainerScriptString}
${setupNodeManagerCreationControl(stackName, credentials)}
`;
};

const setupNodeManagerCreationControl = (stackName, credentials) => {
  return `
# {id:setupNodeManagerCreationControl}
DOCKER_SWARM_JOINTOKEN_WORKER=$(docker swarm join-token worker --quiet)
EC2_INSTANCE_LOCAL_IPV4=$(curl http://169.254.169.254/latest/meta-data/local-ipv4)
DOCKER_SWARM_MANAGER_INSTANCE_ID=$(curl http://169.254.169.254/latest/meta-data/instance-id)

export AWS_ACCESS_KEY_ID=${credentials.aws_access_key_id}
export AWS_SECRET_ACCESS_KEY=${credentials.aws_secret_access_key}
export AWS_DEFAULT_REGION=${credentials.aws_region}

aws ssm put-parameter \
  --name "/swarmClusters/${stackName}/manager/jointoken/as/worker" \
  --value "$DOCKER_SWARM_JOINTOKEN_WORKER" \
  --type "String" \
  --tier Standard \
  --overwrite

aws ssm put-parameter \
  --name "/swarmClusters/${stackName}/manager/ipv4" \
  --value "$EC2_INSTANCE_LOCAL_IPV4" \
  --type "String" \
  --tier Standard \
  --overwrite

aws ssm put-parameter \
  --name "/swarmClusters/managers/$DOCKER_SWARM_MANAGER_INSTANCE_ID/stackName" \
  --value "${stackName}" \
  --type "String" \
  --tier Standard \
  --overwrite
`;
};

const installPortainerScript = () => {
  return `
# {id:portainerInstallation}
# Installing Portainer Server and Agent
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
