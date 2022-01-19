import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { CfnTag } from "aws-cdk-lib";
// Util
import { createHashId } from "../utils/util";

export class Queue {
  private _queue: sqs.CfnQueue;
  private _scope: Construct;

  /**
   * Create the cloudFormation resource for queue
   * @param scope scope context
   * @param config configuration for queue
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    // Extract the attributes and set a list of tag
    const attributes: any = config.Attributes;
    const tags: CfnTag[] = config.Tags !== undefined ? Object.keys(config.Tags).map((key: string): CfnTag => { return {  key: key, value: config.Tags[key] }; }) : [];
    // Extract queue name
    const splitArn: string[] = attributes.QueueArn.split(":");
    const queueName: string = splitArn[splitArn.length - 1];
    // Create the properties for queue [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html]
    const props: sqs.CfnQueueProps = {
      contentBasedDeduplication: attributes.FifoQueue === "true" ? attributes.ContentBasedDeduplication : undefined,
      deduplicationScope: attributes.FifoQueue === "true" ? attributes.DeduplicationScope : undefined,
      delaySeconds: attributes.DelaySeconds !== undefined ? Number(attributes.DelaySeconds) : undefined,
      fifoQueue: attributes.FifoQueue === "true" ? attributes.FifoQueue : undefined,
      fifoThroughputLimit: attributes.FifoQueue === "true" ? attributes.FifoThroughputLimit : undefined,
      kmsDataKeyReusePeriodSeconds: attributes.KmsDataKeyReusePeriodSeconds !== undefined ? Number(attributes.KmsDataKeyReusePeriodSeconds) : undefined,
      kmsMasterKeyId: attributes.KmsMasterKeyId,
      maximumMessageSize: attributes.MaximumMessageSize !== undefined ? Number(attributes.MaximumMessageSize) : undefined,
      messageRetentionPeriod: attributes.MessageRetentionPeriod !== undefined ? Number(attributes.MessageRetentionPeriod) : undefined,
      queueName: queueName,
      receiveMessageWaitTimeSeconds: attributes.ReceiveMessageWaitTimeSeconds !== undefined ? Number(attributes.ReceiveMessageWaitTimeSeconds) : undefined,
      tags: tags.length > 0 ? tags : undefined,
      visibilityTimeout: attributes.VisibilityTimeout !== undefined ? Number(attributes.VisibilityTimeout) : undefined
    };
    // Create the queue
    this._queue = new sqs.CfnQueue(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for queue
   * @returns arn for queue
   */
  public getArn(): string {
    return this._queue.attrArn;
  }

  /**
   * Get a name for queue
   * @returns name for queue
   */
  public getName(): string {
    return this._queue.attrQueueName;
  }

  /**
   * Get an url for queue
   * @returns url for queue
   */
  public getUrl(): string {
    return this._queue.ref;
  }

  /**
   * Set the policy for queue
   * @param config configuration policy
   */
  public setPolicy(config: any): void {
    // Set statement in policy document
    const statement: any[] = [];
    for (const elem of config.Statement) {
      statement.push({
        Action: elem.Action,
        Effect: elem.Effect,
        Principal: elem.Principal,
        Resource: this._queue.attrArn
      });
    }
    // Create the properties for policy [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-sqs-queuepolicy.html]
    const props: sqs.CfnQueuePolicyProps = {
      policyDocument: {
        Version: config.Version,
        Statement: statement
      },
      queues: [this._queue.ref]
    }
    // Create the policy for queue
    new sqs.CfnQueuePolicy(this._scope, createHashId(JSON.stringify(props)), props);
  }
}