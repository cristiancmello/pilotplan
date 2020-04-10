const { spawn } = require("child_process");
const { promisify } = require("util");

const spawnPromise = promisify(spawn);

const callCdkDeploySync = async (cdkDeploySyncParams) => {
  try {
    const {
      cdkAppFullPath,
      cdkBinFullPath,
      cdkOutputFullPath,
      awsCredentials,
      awsRegion,
    } = cdkDeploySyncParams;

    const cdkArgs = [
      "deploy",
      "-o",
      cdkOutputFullPath,
      "--app",
      cdkAppFullPath,
      "--require-approval",
      "never",
    ];

    let { PATH, IS_LOCAL, APP_ENV, PILOTPLAN_HOME_DIR } = process.env;

    const callSpawnPromise = spawnPromise(cdkBinFullPath, cdkArgs, {
      stdio: "inherit",
      cwd: PILOTPLAN_HOME_DIR,
      env: {
        PATH,
        IS_LOCAL,
        APP_ENV,
        HOME: PILOTPLAN_HOME_DIR,
        AWS_REGION: awsRegion,
        ...awsCredentials,
      },
    });

    await callSpawnPromise;

    return {
      command: {
        bin: cdkBinPath,
        args: cdkArgs,
      },
    };
  } catch (error) {
    console.error(error);
  }
};

module.exports.handler = async (event) => {
  let cdkRootPath = "/var/task";
  process.env.PILOTPLAN_HOME_DIR = "/tmp";

  if (process.env.IS_LOCAL) {
    cdkRootPath = ".";
    process.env.PILOTPLAN_HOME_DIR = process.cwd();
  }

  let cdkBinRelativePath = "node_modules/cdk/bin/cdk";
  let cdkBinFullPath = `${cdkRootPath}/${cdkBinRelativePath}`;
  let cdkOutputFullPath = `${process.env.PILOTPLAN_HOME_DIR}/cdk.out`;
  let cdkAppPath = "src/cdkBuilder/bin";
  let appName = "swarmBasicCluster";
  let cdkAppFullPath = `${cdkRootPath}/${cdkAppPath}/${appName}.js`;
  let awsCredentials = {
    AWS_ACCESS_KEY_ID: null || process.env.CDKBUILDER_AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: null || process.env.CDKBUILDER_AWS_SECRET_ACCESS_KEY,
  };

  let awsRegion = null || process.env.CDKBUILDER_AWS_DEFAULT_REGION;

  const output = await callCdkDeploySync({
    cdkAppFullPath,
    cdkBinFullPath,
    cdkOutputFullPath,
    awsCredentials,
    awsRegion,
  });

  return {
    output,
  };
};
