const ssm = require('@middy/ssm')
const Log = require('@dazn/lambda-powertools-logger')
const wrap = require('@dazn/lambda-powertools-pattern-basic')

const { metricScope, Unit } = require('aws-embedded-metrics')
const constants = require('../common/constants')

const DocumentClient = require('aws-sdk/clients/dynamodb').DocumentClient
const dynamodb = new DocumentClient()
const XRay = require('aws-xray-sdk-core')
XRay.captureAWSClient(dynamodb.service)

const { serviceName, stage } = process.env
const tableName = process.env.restaurants_table
const middyCacheEnabled = process.env.middy_cache_enableed
const middyCacheExpiry = process.env.middy_cache_expiry_milliseconds

const findRestaurantsByTheme = async (theme, count) => {
  console.log(`finding (up to ${count}) restaurants with the theme ${theme}...`)
  Log.debug('finding restaurants', {
    count,
    theme
  })
  const req = {
    TableName: tableName,
    Limit: count,
    FilterExpression: 'contains(themes, :theme)',
    ExpressionAttributeValues: { ':theme': theme },
  }

  const resp = await dynamodb.scan(req).promise()
  Log.debug('found restaurants', {
    count: resp.Items.length
  })
  return resp.Items
}

module.exports.handler = wrap(metricScope(metrics =>
  async (event, context) => {
    metrics.setNamespace(constants.APP_NAMESPACE)
    metrics.putDimensions(constants.APP_DIMENSION_LAMBDA)

    const start = Date.now()

    const req = JSON.parse(event.body)
    const theme = req.theme
    const restaurants = await findRestaurantsByTheme(theme, context.config.defaultResults)
    const response = {
      statusCode: 200,
      body: JSON.stringify(restaurants)
    }

    const end = Date.now()

    metrics.putMetric(constants.METRIC_LATENCY, end - start, Unit.Milliseconds)
    metrics.setProperty('RequestId', context.awsRequestId)
    metrics.setProperty('ApiGatewayRequestId', event.requestContext.requestId)

    return response
  })).use(ssm({
  cache: middyCacheEnabled,
  cacheExpiry: middyCacheExpiry,
  setToContext: true,
  fetchData: {
    config: `/${serviceName}/${stage}/search-restaurants/config`,
    //secretString: `/${serviceName}/${stage}/search-restaurants/secretString`
  }
}))
