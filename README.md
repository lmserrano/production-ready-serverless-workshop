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

```shell
vi ~/.aws/credentials
```

Confirm and/or update the values in [./serverless.yml](./serverless.yml), namely:

```yaml
provider:
  # ...
  stage: dev
  region: eu-west-1
```

#### Setup and Installation

```shell
npm install
```

#### Deploy

```shell
npx sls deploy
```

#### Update `.env` file with Serverless and CloudFormation vars

```shell
npx sls export-env --all
```

#### Fill Seed Items

```shell
node seed-restaurants.js
```

----

### Cleanup and Deletion

#### Remove / Delete / Destroy

```shell
npx sls remove
```

----

### Troubleshooting

#### API Gateway Settings overwritten in endpoint configuration

This has been documented here on [GitHub serverless-api-gateway-throttling Issue #16](https://github.com/DianaIonita/serverless-api-gateway-throttling/issues/16) and shall be resolved with:

```shell
sls reset-all-endpoint-settings
```

----

## Additional Commands

### Development and Debugging

#### Installation of Optional Useful Tooling

It is recommended that you have other optional but useful global dependencies available:

```shell
npm i -g lumigo-cli
```

#### Invoke Functions Locally

```shell
npx sls invoke local --function get-index
```

#### Get Logs for Serverless Function (including after Acceptance Tests)

```shell
npx sls logs -f search-restaurants
```

#### Visualize SNS Notifications in Console

```shell
lumigo-cli tail-sns -r "eu-west-1" -n "workshop-luisserrano-dev-RestaurantNotificationTopic-IuiDAZw3TMX6"
```

#### Visualize EventBridge events in Console

```shell
lumigo-cli tail-eventbridge-bus -r "eu-west-1" -n "order_events_dev_luisserrano"
```
