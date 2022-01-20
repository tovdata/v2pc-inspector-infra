import { Construct } from "constructs";
// Service
import { Role, ManagedPolicy } from "../resources/iam";
// Util
import { printMessageForError } from "../utils/print";
import { storeResource } from "../utils/session";
import { loadJsonFile } from "../utils/util";

/**
 * Create the managed policies
 * @param scope scope context
 */
export function createManagedPolicies(scope: Construct) {
  try {
    // Load a configuration
    const configs: any[] = loadJsonFile("policy");

    // Create the managed policies
    for (const config of configs) {
      const policy = new ManagedPolicy(scope, config);
      storeResource("policy", config.PolicyName, policy);
    }
  } catch (err) {
    // Print error message
    if (typeof err === "string" || err instanceof Error) {
      printMessageForError(err);
    }
    // Exit
    process.exit(1);
  }
}

/**
 * Create the roles
 * @param scope scope context
 */
export function createRoles(scope: Construct) {
  try {
    // Load a configuration
    const configs: any[] = loadJsonFile("role");

    // Create the roles
    for (const config of configs) {
      const role = new Role(scope, config.Role);
      storeResource("role", config.Role.RoleName, role);
      // Attach the managed policy
      if (config.AttachedPolicies !== undefined && config.AttachedPolicies.length > 0) {
        role.attachManagedPolicies(config.AttachedPolicies);
      }
    }
  } catch (err) {
    // Print error message
    if (typeof err === "string" || err instanceof Error) {
      printMessageForError(err);
    }
    // Exit
    process.exit(1);
  }
}