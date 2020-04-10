import { spawn, exec, spawnSync } from "child_process";
import { promisify } from "util";

const spawnPromise = promisify(spawn)

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

    const { PATH, IS_LOCAL, APP_ENV, PILOTPLAN_HOME_DIR } = process.env;

    const callSpawnPromise = spawnPromise(cdkBinFullPath, cdkArgs, {
      stdio: 'inherit',
      cwd: PILOTPLAN_HOME_DIR,
      env: {
        PATH, 
        IS_LOCAL, 
        APP_ENV,
        HOME: PILOTPLAN_HOME_DIR,
        AWS_REGION: awsRegion,
        ...awsCredentials,
      }
    })

    await callSpawnPromise

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
  let cdkRootPath = '/var/task'
  let cdkBinRelativePath = 'node_modules/.bin/cdk'
  let cdkBinFullPath = `${cdkRootPath}/${cdkBinRelativePath}`
  let cdkOutputFullPath = `${process.env.PILOTPLAN_HOME_DIR}/cdk.out`
  let cdkAppPath = 'src/cdkBuilder/bin'
  let appName = 'swarmBasicCluster'
  let cdkAppFullPath = `${cdkRootPath}/${cdkAppPath}/${appName}.js`
  let awsCredentials = {
    AWS_ACCESS_KEY_ID: null || process.env.CDKBUILDER_AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: null || process.env.CDKBUILDER_AWS_SECRET_ACCESS_KEY,
  }
  
  let awsRegion = null || process.env.CDKBUILDER_AWS_DEFAULT_REGION

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
