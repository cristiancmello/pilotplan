const { spawn } = require("child_process");
const { promisify } = require("util");

const { CdkDeployParams } = require("../common/CdkDeployParams");

const spawnPromise = promisify(spawn);

/**
 *
 * @param {CdkDeployParams} cdkDeploySyncParams
 */
const callCdkDeploySync = async (cdkDeploySyncParams) => {
  try {
    const {
      appName,
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

    const callSpawnPromise = spawn(cdkBinFullPath, cdkArgs, {
      stdio: "pipe",
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

    callSpawnPromise.stderr.on("data", (data) => {
      console.log(`[stderr]: ${data}`);
    });

    callSpawnPromise.stdout.on("data", (data) => {
      console.log(`[stdout]: ${data}`);
    });

    callSpawnPromise.on("exit", (code, signal) => {
      console.log(`${cdkBinFullPath} exited with ${code} or signal ${signal}`);
    });

    return {
      command: {
        bin: cdkBinFullPath,
        args: cdkArgs,
      },
      region: awsRegion,
      appName,
    };
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  callCdkDeploySync,
};
