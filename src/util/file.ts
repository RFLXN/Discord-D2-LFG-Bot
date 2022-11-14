import { constants, PathLike, promises as fs } from "fs";

const isFileExist = async (path: PathLike): Promise<boolean> => {
    try {
        await fs.access(path, constants.F_OK);
        return true;
    } catch (ignore) {
        return false;
    }
};

export {
    isFileExist
};
