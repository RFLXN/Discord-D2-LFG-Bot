import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { Validator } from "jsonschema";
import loadJson from "../util/loadJson.js";
import LfgActivityMap from "../type/LfgActivityMap.js";

const DIR_NAME = dirname(fileURLToPath(import.meta.url));
const MAP_FILE_PATH = resolve(DIR_NAME, "../../resource/lfg-activity-map.json");
const SCHEMA_FILE_PATH = resolve(DIR_NAME, "../../resource/lfg-activity-map-schema.json");

let activityMap: LfgActivityMap | undefined;
let activityMapSchema: object | undefined;

const loadActivityMap = async () => {
    console.log("Loading LFG Activity Map...");
    activityMap = await loadJson<LfgActivityMap>(MAP_FILE_PATH);
    console.log("LFG Activity Map Loaded.");
};

const loadActivityMapSchema = async () => {
    console.log("Loading LFG Activity Map JSON Schema...");
    const loaded = await loadJson(SCHEMA_FILE_PATH);
    activityMapSchema = loaded as object;
    console.log("LFG Activity Map JSON Schema Loaded.");
};

const getActivityMap = (): LfgActivityMap => activityMap as LfgActivityMap;

const getActivityMapSchema = async () => {
    if (!activityMapSchema) {
        await loadActivityMapSchema();
    }

    return activityMapSchema;
};

const isValidOnSchema = async (map: object) => {
    const validator = new Validator();
    const result = validator.validate(map, await getActivityMapSchema());

    return result.valid;
};

const isValidMap = async (map: string): Promise<boolean> => {
    console.log("Checking LFG Activity Map JSON is Valid...");
    try {
        const parsed = JSON.parse(map);
        if (!(await isValidOnSchema(parsed))) {
            console.log("LFG Activity Map is Invalid.");
            return false;
        }

        console.log("LFG Activity Map JSON is Valid.");
        return true;
    } catch (ignore) {
        console.log("LFG Activity Map is Invalid.");
        return false;
    }
};

const overrideActivityMap = async (map: string): Promise<boolean> => {
    console.log("Trying to Override LFG Activity Map...");
    if (!(await isValidMap(map))) {
        console.log("LFG Activity Map Overriding Canceled.");
        return false;
    }

    await fs.writeFile(MAP_FILE_PATH, map);
    activityMap = JSON.parse(map) as LfgActivityMap;
    console.log("LFG Activity Map Overriding Complete.");
};

export { overrideActivityMap, loadActivityMap, getActivityMap };
