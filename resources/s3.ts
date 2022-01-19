import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { CfnTag } from "aws-cdk-lib";
// Util
import { createHashId } from "../utils/util";

export class Bucket {
  private _bucket: s3.CfnBucket;
  private _scope: Construct;

  /**
   * Create the cloudFormation resource for bucket
   * @param scope scope context
   * @param config configuration for bucket
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    // Set a list of tag
    const tags: CfnTag[] = config.TagSet !== undefined ? config.TagSet.map((elem: any): CfnTag => { return { key: elem.Key, value: elem.Value }; }) : [];
    // Set the cros rules
    const corsRules: s3.CfnBucket.CorsRuleProperty[] = config.CORSRules !== undefined ? config.CORSRules.map((elem: any): s3.CfnBucket.CorsRuleProperty => { return { allowedMethods: elem.AllowedMethods, allowedHeaders: elem.AllowedHeaders, allowedOrigins: elem.AllowedOrigins, exposedHeaders: elem.ExposedHeaders, maxAge: elem.MaxAgeSeconds }; }) : [];
    // Create the properties for bucket [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket.html]
    const props: s3.CfnBucketProps = {
      analyticsConfigurations: config.AnalyticsConfigurationList !== undefined ? Object.keys(config.AnalyticsConfigurationList).length > 0 ? config.AnalyticsConfigurationList : undefined : undefined,
      bucketName: config.Name,
      corsConfiguration: corsRules.length > 0 ? { corsRules: corsRules } : undefined,
      metricsConfigurations: config.MetricsConfigurationList !== undefined ? Object.keys(config.MetricsConfigurationList).length > 0 ? config.MetricsConfigurationList : undefined : undefined,
      intelligentTieringConfigurations: config.IntelligentTieringConfigurationList !== undefined ? Object.keys(config.IntelligentTieringConfigurationList).length > 0 ? config.IntelligentTieringConfigurationList : undefined : undefined,
      inventoryConfigurations: config.InventoryConfigurationList !== undefined ? Object.keys(config.InventoryConfigurationList).length > 0 ? config.InventoryConfigurationList : undefined : undefined,
      ownershipControls: config.OwnershipControls,
      publicAccessBlockConfiguration: Object.keys(config.PublicAccessBlockConfiguration).length > 0 ? config.PublicAccessBlockConfiguration : undefined,
      tags: tags.length > 0 ? tags : undefined,
      versioningConfiguration: config.Versioning !== undefined ? Object.keys(config.Versioning).length > 0 ? config.Versioning : undefined : undefined,
      websiteConfiguration: config.BucketWebsite !== undefined ? Object.keys(config.BucketWebsite).length > 0 ? config.BucketWebsite : undefined : undefined
    };
    // Create the bucket
    this._bucket = new s3.CfnBucket(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for bucket
   * @returns arn for bucket
   */
  public getArn(): string {
    return this._bucket.attrArn;
  }

  /**
   * Get a name for bucket
   * @returns name for bucket
   */
  public getName(): string {
    return this._bucket.ref;
  }
}