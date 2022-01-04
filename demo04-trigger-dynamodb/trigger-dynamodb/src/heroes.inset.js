const uuid = require("uuid");
const Joi = require("@hapi/joi");
const decoratorValitador = require("./util/decoratorValidator");
const enumParams = require("./util/globalEnum");

class Handler {
  constructor({ dynamoDbSvc }) {
    this.dynamoDbSvc = dynamoDbSvc;
    this.dynamoDbTable = process.env.DYNAMODB_TABLE;
  }
  static validator() {
    return Joi.object({
      nome: Joi.string().max(100).min(2).required(),
      poder: Joi.string().max(20).required()
    });
  }
  async insertItem(params) {
    return this.dynamoDbSvc.put(params).promise();
  }
  prepareData(data) {
    const paramas = {
      TableName: this.dynamoDbTable,
      Item: {
        ...data,
        id: uuid.v1(),
        createdAt: new Date().toISOString()
      }
    };
    return paramas;
  }
  handlerSuccess(data) {
    const response = {
      statusCode: 200,
      body: JSON.stringify(data)
    };
    return response;
  }
  handlerError(data) {
    return {
      statusCode: data.statusCode || 501,
      headers: { "Content-Type": "text/plain" },
      body: "Couldn't create item!!"
    };
  }
  async main(event) {
    try {
      /// agora o decorator modifica o body e ja retorna no formato JSON
      const data = event.body;
      console.log(data);

      const dbParams = this.prepareData(data);
      await this.insertItem(dbParams);
      return this.handlerSuccess(dbParams.Item);
    } catch (error) {
      console.error("Deu ruim** ", error.stack);
      return this.handlerError({ statusCode: 500 });
    }
  }
}
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const handler = new Handler({
  dynamoDbSvc: dynamoDB
});
module.exports = decoratorValitador(
  handler.main.bind(handler),
  Handler.validator(),
  enumParams.ARG_TYPE.BODY
);
