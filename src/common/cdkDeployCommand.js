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

    const callExecPromise = execPromise(cdkCommand, {
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

    callExecPromise.child.stderr.on("data", (data) => {
      if (process.env.NODE_ENV === "test") return;
      console.log(`[stderr]: ${data}`);
    });

    callExecPromise.child.stdout.on("data", (data) => {
      if (process.env.NODE_ENV === "test") return;
      console.log(`[stdout]: ${data}`);
    });

    callExecPromise.child.on("exit", (code, signal) => {
      if (process.env.NODE_ENV === "test") return;
      console.log(`${cdkBinFullPath} exited with ${code}, signal ${signal}`);
    });

    await callExecPromise;

    return {
      command: cdkCommand,
      region: awsRegion,
      appName,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "test") {
      console.error(error);
    }

    return {
      error: {
        message: error.message,
        code: error.code,
      },
    };
  }
};

module.exports = {
  callCdkDeploySync,
};
