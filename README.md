# Production-ready Serverless Workshop

This project was created based on, and as part of Yan Cui's [Production Ready Serverless Workshop](https://productionreadyserverless.com/) (January 2023).

For additional information please check the [/docs](./docs) folder, namely:

- [Summary of Work](./docs/Summary-of-work.md)
- [Deviations from Roadmap](./docs/Deviations-from-roadmap.md)

----

## Useful Commands

### Setup and Operation

### Confirm that default values are correctly set

Confirm that you have AWS CLI V2 Installed and that you are using the intended account and region:

```bash
vi ~/.aws/credentials
```

Confirm and/or update the values in [./serverless.yml](./serverless.yml), namely:

```yaml
provider:
  # ...
  stage: dev
  region: eu-west-1
```

#### Deploy Shared Resources

1. In `Identity and Access Management (IAM)`, go to `Identity providers` and `Add provider` of type `OpenID Connect`, with details:
    - Provider URL: `https://token.actions.githubusercontent.com`
    - Click `Get thumbprint`, which should show that it is valid until 2030
    - Audience: `sts.amazonaws.com`
2. Create `AWS IAM` `Role` of type `Web identity` and select the `token.actions.githubusercontent.com` provider created in the previous step
3. Select `sts.amazonaws.com` as the Audience and click `Next`
4. Select `AdministratorAccess` (for simplicity)
5. Select a name, like: `GitHubActionsRole` and then create the role
6. Find the newly created role, and under the `Trust relationships` tab click `Edit trust policy` and replace the Condition section with this (replace `<GitHubOrg>` and `<GitHubRepo>` with your org and repo names):
    ```
    "Condition": {
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:<GitHubOrg>/<GitHubRepo>:*"
      }
    }
    ```
7. Click `Update policy`. Make sure the [.github/workflows/dev.yml](./.github/workflows/dev.yml) file is using the correct `role-to-assume: <IAM ROLE ARN>` value, for this role's ARN.

#### Deploy stage-specific non-automated configurations

Replace `<YOUR_STAGE>` and `<YOUR_SECRET>` in the command below, and run it:

```bash
aws ssm put-parameter --name "/workshop-luisserrano/<YOUR_STAGE>/search-restaurants/secretString" --value "<YOUR_SECRET>" --type SecureString
```

#### Application Setup, Installation and Deployment

```bash
npm install
```

#### Deploy

```bash
npx sls deploy
```

#### Update `.env` file with Serverless and CloudFormation vars

```bash
npx sls export-env --all
```

#### Fill Seed Items

```bash
node seed-restaurants.js
```

----

### Cleanup and Deletion

#### Remove / Delete / Destroy

```bash
npx sls remove
```

#### Delete stage-specific non-automated configurations

Replace `<YOUR_STAGE>` and `<YOUR_SECRET>` in the command below, and run it:

```bash
aws ssm delete-parameters --names "/workshop-luisserrano/<YOUR_STAGE>/search-restaurants/secretString"
```

#### Delete shared resources

> :warning
> 
> Shared resources should only be deleted if they were created in the context of this project and if no other projects were created meanwhile that are using it, otherwise it could cause issues!

Undo what was done on [Deploy Shared Resources](#deploy-shared-resources), namely:

1. Delete the Role created previously
2. Delete the OpenID Connect Identity Provider created previously 

----

### Troubleshooting

#### API Gateway Settings overwritten in endpoint configuration

This has been documented here on [GitHub serverless-api-gateway-throttling Issue #16](https://github.com/DianaIonita/serverless-api-gateway-throttling/issues/16) and shall be resolved with:

```bash
sls reset-all-endpoint-settings
```

----

## Additional Commands

### Development and Debugging

#### Installation of Optional Useful Tooling

It is recommended that you have other optional but useful global dependencies available:

```bash
npm i -g lumigo-cli
```

#### Invoke Functions Locally

```bash
npx sls invoke local --function get-index
```

#### Get Logs for Serverless Function (including after Acceptance Tests)

```bash
npx sls logs -f search-restaurants
```

#### Visualize SNS Notifications in Console

```bash
lumigo-cli tail-sns -r "eu-west-1" -n "workshop-luisserrano-dev-RestaurantNotificationTopic-IuiDAZw3TMX6"
```

#### Visualize EventBridge events in Console

```bash
lumigo-cli tail-eventbridge-bus -r "eu-west-1" -n "order_events_dev_luisserrano"
```
