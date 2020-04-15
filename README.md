# pilotplan

[![Build Status](https://travis-ci.com/cristiancmello/pilotplan.svg?branch=master)](https://travis-ci.com/cristiancmello/pilotplan)

*Your New Robotization Plan*

Orchestration and Automation with AWS Cloudformation and SDK.

## Requisites

### PilotPlan deployment director

* IAM User

* Permissions:
  - AdministratorAccess

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*"
        }
      ]
    }
    ```

* In **Security Credentials**, **create access keys**.

### Environment variables

```sh
# PilotPlan deployment director 
export AWS_ACCESS_KEY_ID={PilotPlan deployment director Access Key Id}
export AWS_SECRET_ACCESS_KEY={PilotPlan deployment director Access Secret Key}
export AWS_REGION=us-east-1

# for testing
export AWS_AMI_DEFAULT=ami-abcd....
export DEFAULT_KEYPAIR_NAME=.....pem
```
