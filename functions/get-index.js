const fs = require("fs")
const Mustache = require('mustache')
const http = require('axios')
const aws4 = require('aws4')
const URL = require('url')
const { metricScope, Unit} = require("aws-embedded-metrics")

const restaurantsApiRoot = process.env.restaurants_api
const cognitoUserPoolId = process.env.cognito_user_pool_id
const cognitoClientId = process.env.cognito_client_id
const awsRegion = process.env.AWS_REGION

const appname = process.env.appname

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const template = fs.readFileSync('static/index.html', 'utf-8')

const getRestaurants = async () => {
    console.log(`loading restaurants from ${restaurantsApiRoot}...`)
    const url = URL.parse(restaurantsApiRoot)
    const opts = {
        host: url.hostname,
        path: url.pathname
    }

    aws4.sign(opts)

    const httpReq = http.get(restaurantsApiRoot, {
        headers: opts.headers
    })
    return (await httpReq).data
}

module.exports.handler = metricScope(metrics =>
  async (event, context) => {
    metrics.setNamespace(appname)
    metrics.putDimensions({ Service: "workshop-luisserrano" })

    const restaurants = await getRestaurants()
    console.log(`found ${restaurants.length} restaurants`)
    const dayOfWeek = days[new Date().getDay()]
    const view = {
        awsRegion,
        cognitoUserPoolId,
        cognitoClientId,
        dayOfWeek,
        restaurants,
        searchUrl: `${restaurantsApiRoot}/search`
    }
    const html = Mustache.render(template, view)
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html; charset=UTF-8'
        },
        body: html
    }

    metrics.putMetric("Count", response.data.length, Unit.Count)
    metrics.setProperty("RequestId", context.awsRequestId)
    metrics.setProperty("ApiGatewayRequestId", event.requestContext.requestId)

    return response
  })
