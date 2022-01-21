import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { CfnTag } from "aws-cdk-lib";
// Util
import { createHashId } from "../utils/util";

export class Function {
  private _function: lambda.CfnFunction;
  private _scope: Construct;

  /**
   * Create the cloudFormation resource for lambda function
   * @param scope scope context
   * @param config configuration for lambda function
   * @param roleArn arn for role to execute lambda
   */
  constructor(scope: Construct, config: any, roleArn: string) {
    this._scope = scope;
    // Extract configuration and set a list of tags
    const functionConfig: any = config.Configuration;
    const tags: CfnTag[] = config.Tags !== undefined && config.Tags !== null ? Object.keys(config.Tags).map((key: string): CfnTag => { return { key: key, value: config.Tags[key] }; }) : [];
    // Create the properties for lambda function [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html]
    const props: lambda.CfnFunctionProps = {
      architectures: ["x86_64"],
      code: {
        s3Bucket: "v2pc-scanned-data",
        s3Key: `lambdaCodes/${decodeURIComponent(functionConfig.FunctionArn)}.zip`
      },
      description: functionConfig.Description,
      environment: functionConfig.Environment,
      functionName: functionConfig.FunctionName,
      handler: functionConfig.Handler,
      memorySize: functionConfig.MemorySize,
      packageType: functionConfig.PackageType,
      role: roleArn,
      runtime: functionConfig.Runtime,
      tags: tags.length > 0 ? tags : undefined,
      timeout: functionConfig.Timeout,
      tracingConfig: functionConfig.TracingConfig
    };
    // Create the lambda function
    this._function = new lambda.CfnFunction(this._scope, createHashId(JSON.stringify(props)), props);

  }

  /**
   * Create an alias for function
   * @param config configuration for alias
   */
  public createAlias(config: any) {
    // Create the properties for lambda function alias [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-alias.html]
    const props: lambda.CfnAliasProps = {
      description: config.Description,
      functionName: this._function.ref,
      functionVersion: config.FunctionVersion,
      name: config.Name
    };
    // Create the lambda function alias
    new lambda.CfnAlias(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Create a version for function
   * @param description version for description
   */
  public createVersion(description: string) {
    // Create the properties for lambda function version [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-version.html]
    const props: lambda.CfnVersionProps = {
      description: description,
      functionName: this._function.ref
    };
    // Create the lambda function version
    new lambda.CfnVersion(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for function
   * @returns arn for function
   */
   public getArn(): string {
    return this._function.attrArn;
  }

  /**
   * Get a name for function
   * @returns name for function
   */
  public getName(): string {
    return this._function.ref;
  }
}