import { Construct } from "constructs";
// Resources
import { Role } from "../resources/iam";
import { Function } from "../resources/lambda";
// Util
import { printMessageForError } from "../utils/print";
import { getResource, storeResource } from "../utils/store";
import { loadJsonFile } from "../utils/util";

export function createLambdaFunctions(scope: Construct) {
  try {
    // Load a configuration
    const rawConfig: any = loadJsonFile("lambda");

    for (const [_, value] of Object.entries(rawConfig.LambdaFunctions)) {
      const config: any = value as any;
      // Get an associated role
      const roleArn: string = associateRole(config.FunctionName);
      // Create a lambda function
      const lambdaFunction = new Function(scope, config, roleArn);
      storeResource("lambda", config.FunctionName, lambdaFunction);
    }
  } catch (err) {
    // Print error meesage
    if (typeof err === "string" || err instanceof Error) {
      printMessageForError(err);
    }
    // Exit
    process.exit(1);
  }
}

/**
 * Get an Association role
 * @param functionName lambda function name
 * @returns arn for associated role
 */
function associateRole(functionName: string): string {
  let role: Role;
  switch(functionName) {
    case "v2pc-api-get_user_info":
      role = getResource("role", "v2pc-inspector-to-read-dynamodb-from-lambda");
      return role.getArn();
    case "v2pc-add-user":
    case "v2pc-api-set_user_info":
      role = getResource("role", "v2pc-inspector-to-read-write-dynamodb-from-lambda");
      return role.getArn();
    case "v2pc-perform-scan-vpc":
      role = getResource("role", "v2pc-inspector-to-scan-vpc");
      return role.getArn();
    case "v2pc-build-initial-view-diagram-from-scanresult":
    case "v2pc-build-and-update-viewdata-for-resourcegroups":
    case "v2pc-role-manage":
    case "v2pc-manage-scanscope":
    case "v2pc-manage-resourcegroup-info":
      role = getResource("role", "v2pc-inspector-to-process-queue");
      return role.getArn();
    case "v2pc-get-viewdata-last":
    case "v2pc-store-viewdata-last":
      role = getResource("role", "v2pc-inspector-to-read-s3-from-lambda");
      return role.getArn();
    case "v2pc-request-scan":
      role = getResource("role", "v2pc-inspector-to-handle-scan-request");
      return role.getArn();
    default:
      role = getResource("role", "v2pc-inspector-to-execute-lambda");
      return role.getArn();
  }
}