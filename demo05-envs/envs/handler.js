"use strict";
const { get } = require("axios");
const cheerio = require("cheerio");
const settings = require("./config/setting");
const AWS = require("aws-sdk");
const uuid = require("uuid");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

class Handler {
  static async main(event) {
    const { data } = await get(settings.commitMessageUrl);
    const $ = cheerio.load(data);
    const [commitMessage] = await $("#content").text().trim().split("\n");
    const params = {
      TableName: settings.dbTableName,
      Item: {
        commitMessage,
        id: uuid.v1(),
        createdAt: new Date().toISOString()
      }
    };
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200
    };
  }
}
module.exports = {
  scheduler: Handler.main
};
