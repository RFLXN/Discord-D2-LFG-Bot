import { PathLike, promises as fs } from "fs";

const loadJson = async <T>(path: PathLike) => {
    const raw = await fs.readFile(path, {
        encoding: "utf-8",
        flag: "r"
    });
    return JSON.parse(raw.toString()) as T;
};

export default loadJson;
