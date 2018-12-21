import apigClientFactory from "aws-api-gateway-client";
import { fileToBase64 } from "./util";

var awsConfig = {
  invokeUrl: "https://316oufn076.execute-api.us-west-2.amazonaws.com/dev",
  apiKey: "",
  region: "us-west-2"
};
var apiClient = apigClientFactory.newClient(awsConfig);

export const trainImages = students => {
  Promise.all(
    students.map(async student => {
      const file = student.file;
      const method = "PUT";
      const pathTemplate = `/images/${file.name}`;
      const additionalParams = {
        headers: {
          "Content-Type": "text/plain"
        }
      };
      const encodedFile = await fileToBase64(file);
      let encodedImage;
      if (file.type === "image/jpeg") {
        encodedImage = encodedFile.substring(23);
      } else {
        encodedImage = encodedFile.substring(22);
      }
      return apiClient.invokeApi(
        null,
        pathTemplate,
        method,
        additionalParams,
        encodedImage
      );
    })
  ).then(() => console.log("Upload success"));
};

export const sendReport = email => {
  const method = "POST";
  const pathTemplate = "/reports";
  const additionalParams = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  const body = { email_id: email };
  return apiClient.invokeApi(
    null,
    pathTemplate,
    method,
    additionalParams,
    body
  );
};

export const setApiKey = key => {
  awsConfig.apiKey = key;
  apiClient = apigClientFactory.newClient(awsConfig);
};
