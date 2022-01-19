const RESOURCE: any = {};

export function storeResource(type: string, key: string, value: any) {
  if (RESOURCE[type] === undefined) RESOURCE[type] = {};
  // Store the resource
  RESOURCE[type][key] = value;
}

export function getResource(type: string, key: string): any {
  return RESOURCE[type][key];
}