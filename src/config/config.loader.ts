import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

const YAML_CONFIG_FILENAME = "config.yaml";

export default () => {
    const address = path.join(__dirname, YAML_CONFIG_FILENAME);
    const content = fs.readFileSync(address, "utf8");
    return yaml.load(content) as Record<string, any>;
}
