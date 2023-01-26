# Summary of Work

This workshop is divided into 4 parts (and weeks).

The parts and steps below have been adapted based on the original roadmap, its suggested extras, and some extras that I have explored.

## Part 1 - Building REST APIs

- Webpage Server-side rendering with restaurants search by theme
  - Decoupling of services with `serverless-export-env`
- Lambda API endpoints for listing and searching restaurants
- DynamoDB restaurant data seeing and storage
- Cognito User Pool user registration
- API Gateway `/search` endpoint secured with IAM

## Part 1 (Optional Extra Work)

- Consider caching at CloudFront level vs API Gateway caching
  - API Gateway caching via `serverless-api-gateway-caching`
- API Gateway throttling via `serverless-api-gateway-throttling`
- Request validation via API Gateway for the POST `/search` endpoint
- Enable detailed CloudWatch metrics
- Custom CloudWatch metrics via `aws-embedded-metrics` using EMF (Embedded Metric Format) underneath
- Separate Serverless resources across multiple files
- Web Application Firewall (WAF) rate-based limiting rules and `serverless-associate-waf`
- Alerts and CloudWatch Dashboards with `serverless-plugin-aws-alerts`

## Part 2 - Testing and CI/CD

- Integration tests
  - `jest` and `@types/jest` for test specs
  - `cheerio` for HTML parsing
  - `awscred` for resolving AWS credentials and signing of HTTP requests with AWS IAM roles
  - `lodash` for mirroring behavior of HTTP client `axios` which will be later used in implementation of acceptance tests
  - Additional libs like `cross-env` and `uuid`

