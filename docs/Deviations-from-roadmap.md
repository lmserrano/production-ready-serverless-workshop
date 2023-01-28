# Deviations from the Roadmap

This file logs the points of the workshop for which deviations of the planned roadmap were observed, as well as associated documentation on alternative approaches followed and their reasoning.

## Part 2 - Testing and CI/CD

### Exercise: Writing integration tests

#### The `serverless-export-env` dependency now correctly handles `!Sub` expressions

- Location/Step: On point `12.` it is suggested to run `npm run test` and that the tests should fail because of `serverless-export-env` supposedly not being able to handle the `!Sub` function correctly and returning the literal `https://${ApiGatewayRestApi}.execute-api.${AWS::Region}.amazonaws.com/${sls:stage}/restaurants`
- Observed: The tests passed. `serverless-export-env` managed to handle the `!Sub` expression correctly and its variables
- Actions Required: No action necessary. `serverless-export-env` on version `^2.2.0` is already handling `!Sub` correctly and there is no need to convert to `Fn::Join` and `!Ref`

#### The `search-restaurants.js` function tests require generation of events and context with fields required by metric implementation

- Location/Step: On point `4` of the `Add test case for search-restaurants`, the tests were supposed to just pass
- Observed: The optional metrics implementation added to that function for measuring database query latency require `event` and `context` to have certain fields
- Actions Required: Update the `when.js` tooling, so that `context.requestId` and `event.requestContext.requestId` are defined. Ideally use `uuid` dev dependency to generate them on a per `we_invoke_*` basis

### Exercise: Set up CI/CD with GitHub Actions

#### CI/CD Configuration Changes

- Location/Step: On `Add GitHub Actions config`, step `4`, after the push, when the GitHub workflow is supposed to be successful
- Observed: The GitHub Actions workflow `deploy` defined in `dev.yml` triggers a warning with:
  ```
  Node.js 12 actions are deprecated. Please update the following actions to use Node.js 16: actions/checkout@v2, actions/setup-node@v1, aws-actions/configure-aws-credentials@master. For more information see: https://github.blog/changelog/2022-09-22-github-actions-all-actions-will-begin-running-on-node16-instead-of-node12/.
  ```
- Actions Required: Update the `.github/workflows/dev.yml`, swapping the following:
  - `actions/checkout@v2` should become: `actions/checkout@v3`
  - `actions/setup-node@v1` should become: `actions/setup-node@v3`
  - `aws-actions/configure-aws-credentials@master` should become: `aws-actions/configure-aws-credentials@v1-node16`
  - Small note: on the GitHub Workflows templates related with Node, `node-version: 16` is presented without string, so we could also change the `node-version: '14'` to number format, although that's not necessary nor relevant
  - Other Important Notes:
    - Make sure that `aws-region: <REGION>` is set to the region you are using
    - Make sure that the Node version you are using matches everywhere. To avoid issues in CI/CD, I've added an `engine` field to the JSON, specifying the NPM and Node.js versions.
      - Note: I've attempted to update everything to Node.js 18 but then rolled back since it's not recommended because `aws-sdk` and its usage need to be updated accordingly (otherwise the sdk v2 needs to be packaged and provided together with the lambda functions)
      - Note: The `npm ci` command was failing with Node.js 14, with: `npm ERR! Cannot read property 'aws-embedded-metrics' of undefined` and so I've updated everything to Node.js 16, since it is the latest updated runtime with support for aws-sdk v2 in Lambdas
    - In order for the steps with a temporary environment to work, it is also necessary to add a step to insert the seed data into the temporary environment:
      ```yaml
      # ...
      # this generates the .env file for the 'ci-dev' stage
      - name: export env
        run: npx sls export-env --all -s ci-dev

      # apply seed data to ci-dev stage
      - name: add seed data
        run: node seed-restaurants.js

      # this runs the integration test against the 'ci-dev' stage
      - name: run integration test
        run: npx cross-env TEST_MODE=handler jest
      # ...
      ```

#### AWS Systems Manager (SSM) Parameter Store Usage (Warning)

- Location/Step: On point `Load SSM parameters at runtime`, point `10.` running the integration tests should pass without warnings.
- Observed: The integration tests still pass but there is the following warning, related with the newly added usage of `middy`:
  ```
  A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.
  ```
- Actions Required: Unknown. [Middy's Documentaiton on Testing](https://middy.js.org/docs/intro/testing) has 3 suggestions, one of which being: `middy(handler, { timeoutEarlyInMillis: 0 })`, but I did not manage to make the warning disappear even when adding it in both function handlers' middy wrappers

#### AWS Systems Manager (SSM) Parameter Store Usage in Temporary Environment from GitHub Actions

- Location/Step: After `Publicize service information to Parameter Store`'s last step, if pushing the commits to GitHub, and if the temporary environment was setup in the workflows file for the GitHub Action, then the action will fail because this environment will not have the associated parameters
- Observed: The temporary `ci-dev` environment is missing the AWS SSM parameters which we manually created before
- Actions Required: Update the `.github/workflows/dev.yml` file to include steps for creating and deleting them
  - Note: This is a bit of a temporary workaround/fix, because the ideal is for this to be part of the stack's definition and be provided via CloudFormation template within serverless, but since we may want the values to not be reset across deployments, this workaround looked suitable for the time being.
