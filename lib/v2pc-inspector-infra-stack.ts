import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class V2PcInspectorInfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }
}
