# pilotplan

[![Build Status](https://travis-ci.com/cristiancmello/pilotplan.svg?branch=master)](https://travis-ci.com/cristiancmello/pilotplan)

An API to manager Deployment of AWS CDK and Cloudformation stacks.

## Requisites

### Environment variables

```sh
export AWS_ACCESS_KEY_ID=AKIA....
export AWS_SECRET_ACCESS_KEY=acbd123...
export AWS_REGION=us-east-1

# for testing
export AWS_AMI_DEFAULT=ami-abcd....
export DEFAULT_KEYPAIR_NAME=.....pem
```

### Deployment Director User

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