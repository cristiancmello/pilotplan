const { exec } = require("child_process");
const { promisify } = require("util");

const { CdkDestroyParams } = require("../common/CdkDestroyParams");

const execPromise = promisify(exec);

/**
 * Call Cdk Destroy command.
 *
 * @example
 * const response = await callCdkDestroySync(
 *   new CdkDestroyParams("emptyApp", "us-east-1", {})
 * );
 *
 * @param {CdkDeployParams} cdkDestroySyncParams
 */
const callCdkDestroySync = async (cdkDestroySyncParams) => {
  try {
    const {
      appName,
      cdkAppFullPath,
      cdkBinFullPath,
      awsCredentials,
      awsRegion,
      extraParams,
    } = cdkDestroySyncParams;

    const cdkArgsArray = ["destroy", "--app", cdkAppFullPath, "--force"];

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
    return {
      error: {
        message: error.message,
        code: error.code,
      },
    };
  }
};

module.exports = {
  callCdkDestroySync,
};
