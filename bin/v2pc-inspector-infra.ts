#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { V2PcInspectorInfraStack } from '../lib/v2pc-inspector-infra-stack';
// Util
import { loadJsonFile } from "../utils/util";

// Initialization
(() => {
  const envConfig: any = loadJsonFile("env/env");
  // Set enviroments
  process.env = envConfig;
})();

const app = new cdk.App();
new V2PcInspectorInfraStack(app, 'V2PcInspectorInfraStack', {
  // For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
  env: { account: process.env.ACCOUNT, region: process.env.REGION },
});