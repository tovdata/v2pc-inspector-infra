import { readFileSync } from "fs";
import { join } from "path";

test("Test", () => {
  // Read a test data file
  const rawData: string = readFileSync(join(__dirname, "../configs/apigateway.json")).toString();
  // Transform to json
  const data: any = JSON.parse(rawData);
  // Extract resources part
  const resources: any[] = data.RestApis[0].Resources;

  const tree: any = {};
  for (const resource of resources) {
    const paths: string[] = resource.path.split("/");
    let parent: any = null;
    for (const path of paths) {
      if (parent === null) {
        if (tree[path] === undefined) {
          tree[path] = {};
        }
        parent = tree[path];
      } else {
        if (path !== "" && parent[path] === undefined) {
          parent[path] = {};
        }
        parent = parent[path];
      }
    }
  }
  console.log(tree)

  createChild("", tree[""]);

  console.log("END")
});

function createChild(path: string, tree: any) {
  for (const key of Object.keys(tree)) {
    const newPath = `${path}/${key}`;
    console.log(newPath);
    createChild(newPath, tree[key]);
  }
}