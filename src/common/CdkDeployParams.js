class CdkDeployParams {
  constructor(appName, region, extraParams, awsAccessKeyId, awsSecretAccessKey) {
    this.region = region;
    this.extraParams = JSON.stringify(extraParams);

    if (new String(appName).match(/^(?!\d)(\w*)$/) === null) {
      throw new Error(`Application Name '${appName}' not valid.`)
    }

    this.appName = appName;

    this.cdkRootPath = "/var/task";
    process.env.PILOTPLAN_HOME_DIR = "/tmp";

    if (process.env.IS_LOCAL) {
      this.cdkRootPath = ".";
      process.env.PILOTPLAN_HOME_DIR = process.cwd();
    }

    this.cdkBinRelativePath = "node_modules/cdk/bin/cdk";
    this.cdkBinFullPath = `${this.cdkRootPath}/${this.cdkBinRelativePath}`;
    this.cdkOutputFullPath = `${process.env.PILOTPLAN_HOME_DIR}/cdk.out`;
    this.cdkAppPath = "src/cdkBuilder/bin";
    this.cdkAppFullPath = `${this.cdkRootPath}/${this.cdkAppPath}/${this.appName}.js`;
    this.awsCredentials = {
      AWS_ACCESS_KEY_ID:
        awsAccessKeyId || process.env.CDKBUILDER_AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY:
        awsSecretAccessKey || process.env.CDKBUILDER_AWS_SECRET_ACCESS_KEY,
    };

    this.awsRegion = region || process.env.CDKBUILDER_AWS_DEFAULT_REGION;
  }
}

module.exports = {
  CdkDeployParams,
};
