const APP_ROOT = '../../'
const _ = require('lodash')
const { v4: uuidv4 } = require('uuid');

const viaHandler = async (event, functionName) => {
    const handler = require(`${APP_ROOT}/functions/${functionName}`).handler

    const context = { requestId: event.requestContext.requestId }
    const response = await handler(event, context)
    const contentType = _.get(response, 'headers.Content-Type', 'application/json');
    if (response.body && contentType === 'application/json') {
        response.body = JSON.parse(response.body);
    }
    return response
}

const generateEvent = eventContents => {
    const event = { requestContext: { requestId: uuidv4({},{}, {}) }}
    return {...event, ...eventContents};
}

const we_invoke_get_index = () => viaHandler(generateEvent(), 'get-index')
const we_invoke_get_restaurants = () => viaHandler(generateEvent(), 'get-restaurants')
const we_invoke_search_restaurants = theme => {
    let event = generateEvent({
        body: JSON.stringify({ theme })
    })
    return viaHandler(event, 'search-restaurants')
}

module.exports = {
    we_invoke_get_index,
    we_invoke_get_restaurants,
    we_invoke_search_restaurants
}
