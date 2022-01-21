import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { CfnTag } from "aws-cdk-lib";
// Util
import { createHashId } from "../utils/util";

export class RestApi {
  private _mapping: any;
  private _restApi: apigateway.CfnRestApi;
  private _scope: Construct;

  /**
   * Create the cloudFormation resource for rest api
   * @param scope scope context
   * @param config configuration for rest api
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    this._mapping = { authorizer: {}, method: {}, model: {}, resource: {}, requestValidator: {} };
    // Extract configuration and set a list of tags
    const tags: CfnTag[] = config.tags !== undefined ? Object.keys(config.tags).map((key: string): CfnTag => { return { key: key, value: config.tags[key] }; }) : [];
    // Create the properties for rest api [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html]
    const props: apigateway.CfnRestApiProps = {
      apiKeySourceType: config.apiKeySource,
      description: config.description,
      disableExecuteApiEndpoint: config.disableExecuteApiEndpoint,
      endpointConfiguration: config.endpointConfiguration,
      name: config.name,
      tags: tags.length > 0 ? tags : undefined
    };
    // Create the rest api
    this._restApi = new apigateway.CfnRestApi(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Create the authorizer in rest api
   * @param config authorizer configuration
   */
  public createAuthorizer(config: any): void {
    // Create the properties for authorizer [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-authorizer.html]
    const props: apigateway.CfnAuthorizerProps = {
      authType: config.authType,
      identitySource: config.identitySource,
      name: config.name,
      providerArns: config.providerARNs !== undefined ? config.providerARNs.length > 0 ? config.providerARNs : undefined : undefined,
      restApiId: this._restApi.ref,
      type: config.type
    };
    // Create the authorizer
    const authorizer = new apigateway.CfnAuthorizer(this._scope, createHashId(JSON.stringify(props)), props);
    this._mapping.authorizer[config.id] = authorizer.ref;
  }

  /**
   * Create the gateway response
   * @param config gateway response configuration
   */
  public createGatewayResponse(config: any): void {
    // Create the properties for gateway response [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-gatewayresponse.html]
    const props: apigateway.CfnGatewayResponseProps = {
      responseType: config.responseType,
      restApiId: this._restApi.ref,
      responseParameters: config.responseParameters !== undefined ? Object.keys(config.responseParameters).length > 0 ? config.responseParameters : undefined : undefined,
      responseTemplates: config.responseTemplates !== undefined ? Object.keys(config.responseTemplates).length > 0 ? config.responseTemplates : undefined : undefined,
      statusCode: config.statusCode
    };
    // Create the gateway response
    new apigateway.CfnGatewayResponse(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Create the resource methods
   * @param configs resource methods configuration
   */
  public createMethod(path: string, config: any): void {
    const resourceId = this._mapping.resource[path];
    for (const methodType of Object.keys(config)) {
      const methodOptions = config[methodType];
      // Set the request models in method
      const requestModels: any = {};
      if (methodOptions.requestModels !== undefined) {
        Object.entries(methodOptions.requestModels).forEach((elem: any) => requestModels[elem.key]=elem.value);
      }
      // Set the method responses
      const methodResponses: apigateway.CfnMethod.MethodResponseProperty[] = methodOptions.methodResponses !== undefined ? Object.keys(methodOptions.methodResponses).map((key: string) => {
        const value: any = methodOptions.methodResponses[key];
        // Set the request models in method responses
        const requestModels: any = {};
        if (value.requestModels !== undefined) {
          Object.entries(value.requestModels).forEach((elem: any) => requestModels[elem.key]=elem.value);
        }
        // Return
        return {
          statusCode: value.statusCode,
          responseParameters: value.responseParameters,
          responseModels: Object.keys(requestModels).length > 0 ? requestModels : undefined,
        }
      }) : [];
      // Set the properties for resource method [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-method.html]
      const props: apigateway.CfnMethodProps = {
        apiKeyRequired: methodOptions.apiKeyRequired,
        httpMethod: methodOptions.httpMethod,
        methodResponses: methodResponses.length > 0 ? methodResponses : undefined,
        resourceId: resourceId,
        restApiId: this._restApi.ref,
        requestModels: Object.keys(requestModels).length > 0 ? requestModels : undefined,
        requestParameters: methodOptions.requestParameters !== undefined ? Object.keys(methodOptions.requestParameters).length > 0 ? methodOptions.requestParameters : undefined : undefined,
        requestValidatorId: methodOptions.requestValidatorId !== undefined ? this._mapping.requestValidator[methodOptions.requestValidatorId] : undefined
      };
      // Create the resource method
      this._mapping.method[`${path}:${methodOptions.httpMethod}`] = new apigateway.CfnMethod(this._scope, createHashId(JSON.stringify(props)), props);
    }
  }

  /**
   * Create the model to process request
   * @param configs model configuration
   */
  public createModel(config: any): void {
    if (config.name !== "Empty" && config.name !== "Error") {     // Empty와 Error는 REST API를 생성할 때, 기본적으로 함께 생성되는 모델이기 때문에 다시 생성하지 않음
      // Create the properties for model in rest api [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-model.html]
      const props: apigateway.CfnModelProps = {
        contentType: config.contentType,
        description: config.description,
        name: config.name,
        restApiId: this._restApi.ref,
        schema: config.schema !== undefined ? JSON.parse(config.schema) : undefined
      };
      // Create the model
      const model = new apigateway.CfnModel(this._scope, createHashId(JSON.stringify(props)), props);
      this._mapping.model[config.name] = model.ref;
    }
  }

  /**
   * Create the resources in rest api
   * @param configs resources configuration
   */
  public createResources(configs: any[]): void {
    // Create the path tree based resources path
    const tree: any = {};
    for (const resource of configs) {
      const paths: string[] = resource.path.split("/");
      let parent: any = null;
      for (const path of paths) {
        if (parent === null) {
          if (tree[path] === undefined) tree[path] = {};
          parent = tree[path];
        } else {
          if (path !== "" && parent[path] === undefined) parent[path] = {};
          parent = parent[path];
        }
      }
    }

    // Create the child resources
    this.createResource(this._restApi.attrRootResourceId, "", tree[""]);
  }

  /**
   * Create the resource (recursive function)
   * @param parentId parent resource id
   * @param tree path tree
   */
  private createResource(parentId: string, resourcePath: string, tree: any): void {
    for (const key of Object.keys(tree)) {
      // Create the resource path
      const path: string = `${resourcePath}/${key}`;
      // Set properties for resource in rest api [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-resource.html]
      const props: apigateway.CfnResourceProps = {
        parentId: parentId,
        pathPart: key,
        restApiId: this._restApi.ref
      };
      // Create the resource in rest api
      const resource = new apigateway.CfnResource(this._scope, createHashId(JSON.stringify(props)), props);
      this._mapping.resource[path] = resource.ref;
      // If you have a child node, execute a recursive function.
      if (tree[key] !== undefined) {
        this.createResource(resource.ref, path, tree[key]);
      }
    }
  }

  /**
   * Create the request validator in rest api
   * @param configs request validator configuration
   */
  public createRequestValidator(config: any): void {
    // Create the properties for request validator [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-requestvalidator.html]
    const props: apigateway.CfnRequestValidatorProps = {
      name: config.name,
      restApiId: this._restApi.ref,
      validateRequestBody: config.validateRequestBody,
      validateRequestParameters: config.validateRequestParameters
    };
    // Create the request validator
    const requestValidator = new apigateway.CfnRequestValidator(this._scope, createHashId(JSON.stringify(props)), props);
    this._mapping.requestValidator[config.id] = requestValidator.ref;
  }

  /**
   * Get an id for rest api
   * @returns id for rest api
   */
  public getId(): string {
    return this._restApi.ref;
  }

  /**
   * Link an authorizer to resource method
   * @param path resource path
   * @param config resource method configuration
   */
  public linkAuthorizerToMethod(path: string, config: any) {
    for (const methodType of Object.keys(config)) {
      // Extract the method options
      const methodOptions = config[methodType];
      // Get a method resource
      const method = this._mapping.method[`${path}:${methodOptions.httpMethod}`];
      // Set an authorizer
      if (methodOptions.authorizationType !== undefined) {
        method.addPropertyOverride("AuthorizationType", methodOptions.authorizationType);
        if (methodOptions.authorizationType !== undefined) {
          method.addPropertyOverride("AuthorizerId", this._mapping.authorizer[methodOptions.authorizerId]);
        }
        if (methodOptions.authorizationScopes !== undefined && methodOptions.authorizationScopes.length > 0) {
          method.addPropertyOverride("AuthorizationScopes", methodOptions.authorizationScopes);
        }
      }
    }
  }
}