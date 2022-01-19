import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// Services
import { createManagedPolicies, createRoles } from '../services/iam';

export class V2PcInspectorInfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the managed policies
    createManagedPolicies(this);
    // Create the roles
    createRoles(this);
  }
}
