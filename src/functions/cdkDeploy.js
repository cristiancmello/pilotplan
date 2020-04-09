import { spawn } from "child_process";

const callCdkDeploySync = async (props) => {
  try {
    const {
      appName,
      cdkBinPath,
      defaultCdkAppPath,
      defaultCdkAppExtension,
      cdkRootPath,
      awsCredentials,
      awsRegion,
      cdkOutputDir,
    } = props;

    const cdkDeployAppArg = `${defaultCdkAppPath}/${appName}.${defaultCdkAppExtension}`,
      cdkArgs = [
        "deploy",
        "-o",
        cdkOutputDir,
        "--app",
        cdkDeployAppArg,
        "--require-approval",
        "never",
      ];

    const { PATH, IS_LOCAL, APP_ENV, LAMBDA_TASK_ROOT } = process.env;

    // const childPromisePromise = spawn(cdkBinPath, cdkArgs, {
    //   cwd: cdkRootPath,
    //   env: {
    //     PATH,
    //     IS_LOCAL,
    //     APP_ENV,
    //     LAMBDA_TASK_ROOT,
    //     AWS_REGION: awsRegion,
    //     ...awsCredentials,
    //   },
    // });

    const childPromisePromise = spawn("ls", {
      cwd: "/var/task",
      env: {
        PATH,
        IS_LOCAL,
        APP_ENV,
        AWS_REGION: awsRegion,
        ...awsCredentials,
      },
    });

    childPromisePromise.on("exit", (code, signal) => {
      console.log(`Exited with code ${code} and signal ${signal}`);
    });

    childPromisePromise.stderr.on("data", (data) => {
      console.log(`[stderr]:`, data.toString());
    });

    childPromisePromise.stdout.on("data", (data) => {
      console.log(`[stdout]:`, data.toString());
    });

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

export const handler = async (event) => {
  let cdkBinPath = "node_modules/.bin/cdk";

  if (process.env.IS_LOCAL == false) {
    cdkBinPath = "/var/task";
  }

  const output = await callCdkDeploySync({
    appName: "swarmBasicCluster",
    cdkBinPath,
    defaultCdkAppPath: "src/cdkBuilder/bin",
    defaultCdkAppExtension: "js",
    cdkRootPath: "../../",
    cdkOutputDir: "/tmp/cdk.out",
    awsCredentials: {
      AWS_ACCESS_KEY_ID: null || process.env.CDKBUILDER_AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY:
        null || process.env.CDKBUILDER_AWS_SECRET_ACCESS_KEY,
    },
    awsRegion: null || process.env.CDKBUILDER_AWS_DEFAULT_REGION,
  });

  return {
    output,
  };
};
