import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
// Util
import { getResource } from "../utils/session";
import { createHashId } from "../utils/util";

export class ManagedPolicy {
  private _policy: iam.CfnManagedPolicy;
  private _scope: Construct;

  /**
   * Create the cloudFormation resource for managed policy
   * @param scope scope context
   * @param config configuration for managed policy
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    // Create the properties for managed policy [Ref. https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-managedpolicy.html]
    const props: iam.CfnManagedPolicyProps = {
      description: config.Description,
      managedPolicyName: config.PolicyName,
      path: config.Path,
      policyDocument: config.PolicyDocument
    };
    // Create the managed policy
    this._policy = new iam.CfnManagedPolicy(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for managed policy
   * @returns arn for managed policy
   */
  public getArn(): string {
    return this._policy.ref;
  }
}

export class Role {
  private _role: iam.CfnRole;
  private _scope: Construct;

  /**
   * Create the cloudFormation resource for role
   * @param scope scope context
   * @param config configuration for role
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    // Set the inline policies
    const policies: iam.CfnRole.PolicyProperty[] = config.Policies !== undefined ? config.Policies.map((elem: any) => { return { policyDocument: elem.PolicyDocument, policyName: elem.PolicyName }; }) : [];
    // Create the properties for role [Ref. https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html]
    const props: iam.CfnRoleProps = {
      assumeRolePolicyDocument: config.AssumeRolePolicyDocument,
      description: config.Description,
      maxSessionDuration: config.MaxSessionDuration,
      path: config.Path,
      policies: policies.length > 0 ? policies : undefined,
      roleName: config.RoleName
    };
    // Create the role
    this._role = new iam.CfnRole(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Attach the managed policies
   * @param config configuration for managed policies
   */
  public attachManagedPolicies(config: any[]) {
    // Extract the managed policies
    const managedPolicies: string[] = [];
    for (const elem of config) {
      const policyArn: string = elem.PolicyArn;
      // Check whether there is a managed policy
      if (policyArn.match(/^arn:aws:iam::aws/g)) {
        managedPolicies.push(policyArn);
      } else {
        const policy: any = getResource("policy", elem.PolicyName);
        if (policy !== undefined && policy instanceof ManagedPolicy) {
          managedPolicies.push(policy.getArn());
        }
      }
    }
    // Attach the managed policies
    this._role.addPropertyOverride("ManagedPolicyArns", managedPolicies);
  }

  /**
   * Get an arn for role
   * @returns arn for role
   */
  public getArn(): string {
    return this._role.attrArn;
  }

  /**
   * Get name for role
   * @returns name for role
   */
  public getName(): string {
    return this._role.ref;
  }
}