import { Construct } from "constructs";
// Resources
import { RestApi } from "../resources/apigateway";
// Util
import { printMessageForError } from "../utils/print";
import { loadJsonFile } from "../utils/util";

export function createRestApi(scope: Construct): void {
  try {
    // Load a configuration
    const apigatewayConfig: any = loadJsonFile("apigateway");

    // Create the rest api
    for (const config of apigatewayConfig.RestApis) {
      // Create the api gateway based rest api
      const restApi = new RestApi(scope, config);

      // Create the authorizer
      if (config.Authorizers !== undefined) {
        for (const elem of config.Authorizers) {
          restApi.createAuthorizer(elem);
        }
      }
      // Create the gateway responses
      if (config.GatewayResponses !== undefined) {
        for (const elem of config.GatewayResponses) {
          restApi.createGatewayResponse(elem);
        }
      }
      // Create the models to process request
      if (config.Models !== undefined) {
        for (const elem of config.Models) {
          restApi.createModel(elem);
        }
      }
      // Create the reqeust validators
      if (config.RequestValidators !== undefined) {
        for (const elem of config.RequestValidators) {
          restApi.createRequestValidator(elem);
        }
      }
      // Create the resources
      if (config.Resources !== undefined) {
        restApi.createResources(config.Resources);
        // Create the reousrce methods
        for (const elem of config.Resources) {
          if (elem.resourceMethods !== undefined) {
            restApi.createMethod(elem.path, elem.resourceMethods);
          }
        }
        // Link an authorizer
        for (const elem of config.Resources) {
          if (elem.resourceMethods !== undefined) {
            restApi.linkAuthorizerToMethod(elem.path, elem.resourceMethods);
          }
        }
        // // Create the integration for method
        // for (const elem of config.Resources) {
        //   if (elem.resourceMethods !== undefined) {
        //     for (const [key, value] of Object.entries(elem.resourceMethods)) {
        //       restApi.integrationForMethod(elem.path, key, value as any);
        //     }
        //   }
        // }
      }
    }
  } catch (err) {
    // Print error message
    if (typeof err === "string" || err instanceof Error) {
      printMessageForError(err);
    }
    // Exit
    process.exit(1);
  }
}