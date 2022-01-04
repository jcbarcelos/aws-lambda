"use strict";
const {
  promises: { readFile }
} = require("fs");
const axios = require("axios");
const aws = require("aws-sdk");

class Handler {
  constructor({ rekoSvc, translatorSvc }) {
    this.rekoSvc = rekoSvc;
    this.translatorSvc = translatorSvc;
  }
  async detectImageLabels(buffer) {
    var params = {
      Image: {
        Bytes: buffer
      },
      MaxLabels: 123,
      MinConfidence: 70
    };
    const result = await this.rekoSvc.detectLabels(params).promise();
    const workingItems = result.Labels.filter(
      ({ Confidence }) => Confidence > 80
    );
    const names = workingItems.map(({ Name }) => Name).join(" and ");

    return { names, workingItems };
  }
  async translatorText(text) {
    const params = {
      SourceLanguageCode: "en",
      TargetLanguageCode: "pt",
      Text: text
    };
    const { TranslatedText } = await this.translatorSvc
      .translateText(params)
      .promise();

    return TranslatedText.split(" e ");
  }
  formatTextResults(texts, workingItems) {
    const finalText = [];
    for (const indexText in texts) {
      const nameInPortugueses = texts[indexText];
      const confidence = workingItems[indexText].Confidence;
      finalText.push(
        `${confidence.toFixed(2)}% de ser do tipo ${nameInPortugueses}`
      );
    }
    return finalText.join(" \n ");
  }
  async getImageBuffer(imageUrl) {
    const response = await axios({
      method: "get",
      url: imageUrl,
      responseType: "arraybuffer"
    });
    const buffer = Buffer.from(response.data, "base64");
    return buffer;
  }
  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters;
      // const imgBuffer = await readFile("./img/cat.jpeg");
      console.log("downloading image ...");
      const buffer = await this.getImageBuffer(imageUrl);
      console.log("Detecting labels...");
      const { names, workingItems } = await this.detectImageLabels(buffer);
      console.log("translating to Portuguese...");
      const text = await this.translatorText(names);
      console.log("handleing final object...");
      const finalText = this.formatTextResults(text, workingItems);
      console.log("finishing...");
      return {
        statusCode: 200,
        body: "A imagem tem \n ".concat(finalText)
      };
    } catch (error) {
      console.log("Error***", error.stack);
      return {
        statusCode: 500,
        body: "Internal server error!"
      };
    }
  }
}

aws.config.apiVersions = {
  rekognition: "2016-06-27"
  // other service API versions
};

const reko = new aws.Rekognition();
const translator = new aws.Translate();
const handler = new Handler({
  rekoSvc: reko,
  translatorSvc: translator
});
module.exports.main = handler.main.bind(handler);
