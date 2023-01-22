const { metricScope, Unit } = require("aws-embedded-metrics")
const DocumentClient = require('aws-sdk/clients/dynamodb').DocumentClient
const dynamodb = new DocumentClient()

const defaultResults = process.env.defaultResults || 8
const tableName = process.env.restaurants_table

const appname = process.env.appname

const findRestaurantsByTheme = async (theme, count) => {
    console.log(`finding (up to ${count}) restaurants with the theme ${theme}...`)
    const req = {
        TableName: tableName,
        Limit: count,
        FilterExpression: "contains(themes, :theme)",
        ExpressionAttributeValues: { ":theme": theme }
    }

    const resp = await dynamodb.scan(req).promise()
    console.log(`found ${resp.Items.length} restaurants`)
    return resp.Items
}

module.exports.handler = metricScope(metrics =>
  async (event, context) => {
    metrics.setNamespace(appname)
    metrics.putDimensions({ Service: "workshop-luisserrano" })

    const req = JSON.parse(event.body)
    const theme = req.theme
    const restaurants = await findRestaurantsByTheme(theme, defaultResults)
    const response = {
        statusCode: 200,
        body: JSON.stringify(restaurants)
    }

    metrics.putMetric("Count", response.data.length, Unit.Count)
    metrics.setProperty("RequestId", context.awsRequestId)
    metrics.setProperty("ApiGatewayRequestId", event.requestContext.requestId)

    return response
  })
