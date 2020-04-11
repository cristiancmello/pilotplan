const { exec } = require("child_process");
const { promisify } = require("util");

const { CdkDeployParams } = require("../common/CdkDeployParams");

const execPromise = promisify(exec);

/**
 * Call Cdk Deploy command.
 *
 * @example
 * const response = await callCdkDeploySync(
 *   new CdkDeployParams("emptyApp", "us-east-1", {})
 * );
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
      extraParams,
    } = cdkDeploySyncParams;

    const cdkArgsArray = [
      "deploy",
      "-o",
      cdkOutputFullPath,
      "--app",
      cdkAppFullPath,
      "--require-approval",
      "never",
    ];

    let cdkArgsString = cdkArgsArray.join(" ");
    let cdkCommand = `${cdkBinFullPath} ${cdkArgsString}`;

    let { PATH, IS_LOCAL, APP_ENV, PILOTPLAN_HOME_DIR } = process.env;

    const callSpawnPromise = execPromise(cdkCommand, {
      stdio: "pipe",
      cwd: PILOTPLAN_HOME_DIR,
      env: {
        EXTRA_PARAMS: extraParams,
        PATH,
        IS_LOCAL,
        APP_ENV,
        HOME: PILOTPLAN_HOME_DIR,
        AWS_REGION: awsRegion,
        ...awsCredentials,
      },
    });

    callSpawnPromise.child.stderr.on("data", (data) => {
      console.log(`[stderr]: ${data}`);
    });

    callSpawnPromise.child.stdout.on("data", (data) => {
      console.log(`[stdout]: ${data}`);
    });

    callSpawnPromise.child.on("exit", (code, signal) => {
      console.log(`${cdkBinFullPath} exited with ${code}, signal ${signal}`);
    });

    await callSpawnPromise;

    return {
      command: cdkCommand,
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
