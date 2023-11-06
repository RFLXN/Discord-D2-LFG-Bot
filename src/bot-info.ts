import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import loadJson from "./util/loadJson.js";
import { BotInfo } from "./type/BotInfo.js";

const DIR_NAME = dirname(fileURLToPath(import.meta.url));
const INFO_FILE_PATH = resolve(DIR_NAME, "../resource/bot-info.json");

let token: string | undefined;
let owner: string | undefined;

const loadInfo = async (): Promise<BotInfo> => {
    const info = await loadJson<BotInfo>(INFO_FILE_PATH);
    return info;
};

const getInfo = async (): Promise<BotInfo> => {
    if (typeof token == "undefined" || typeof owner == "undefined") {
        const info = await loadInfo();
        token = info.token;
        owner = info.owner;
    }
    return {
        token,
        owner
    };
};

const applyToken = async (t: string) => {
    const obj = {
        token: t,
        owner
    };

    await fs.writeFile(INFO_FILE_PATH, JSON.stringify(obj));

    token = t;
};

const applyOwner = async (o: string) => {
    const obj = {
        token,
        owner: o
    };

    await fs.writeFile(INFO_FILE_PATH, JSON.stringify(obj));

    owner = o;
};

export { getInfo, applyToken, applyOwner };
