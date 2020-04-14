const lodash = require("lodash");
const cdk = require("@aws-cdk/core");

class Stack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    this.config = {};
    this.resources = {};
  }

  setConfig = (awsResourceClass, id, config) => {
    let awsResourceClassName = awsResourceClass.name;

    this.config[awsResourceClassName] = lodash.mergeWith(
      this.config[awsResourceClassName],
      {
        [id]: config,
      }
    );

    this.resources[awsResourceClassName] = {
      [id]: (config) => {
        this.config[awsResourceClassName][id] = lodash.mergeWith(
          this.config[awsResourceClassName][id],
          config
        );

        return new awsResourceClass(
          this,
          id,
          this.config[awsResourceClassName][id]
        );
      },
    };

    return this.resources[awsResourceClassName][id];
  };

  getConfig = (awsResourceClass, id) => {
    return this.config[awsResourceClass.name][id];
  };
}

module.exports = {
  Stack,
};
