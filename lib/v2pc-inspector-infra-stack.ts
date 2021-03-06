import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// Services
import { createRestApi } from '../services/apigateway';
import { createManagedPolicies, createRoles } from '../services/iam';
import { createLambdaFunctions } from '../services/lambda';

export class V2PcInspectorInfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the managed policies
    createManagedPolicies(this);
    // Create the roles
    createRoles(this);

    // Create the lambda functions
    createLambdaFunctions(this);

    // Create the api gateway (rest api)
    createRestApi(this);
  }
}
