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

