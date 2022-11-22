import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { LfgLocaleMap, LfgLocaleMapElements } from "../type/LfgLocaleMap";
import loadJson from "../util/loadJson";

const DIR_NAME = dirname(fileURLToPath(import.meta.url));
const MAP_FILE_PATH = resolve(DIR_NAME, "../../resource/lfg-locale-map.json");

let localeMap: LfgLocaleMap | undefined;

const loadLfgLocaleMap = async () => {
    console.log("Loading LFG Locale Map...");
    localeMap = await loadJson<LfgLocaleMap>(MAP_FILE_PATH);
    console.log("LFG Locale Map Loaded.");
};

const getLfgLocaleMap = () => localeMap as LfgLocaleMap;

const getLocalizedString = (locale: keyof LfgLocaleMap, key: keyof LfgLocaleMapElements) => {
    const target = localeMap[locale][key];
    if (!target) return localeMap.default[key];
    return target;
};

const getStrings = (key: keyof LfgLocaleMapElements) => {
    const locales = Object.keys(localeMap) as (keyof LfgLocaleMap)[];
    const strings: { locale: keyof LfgLocaleMap, value: string }[] = [];
    locales.map((locale) => strings.push({
        locale,
        value: localeMap[locale][key]
    }));

    return strings;
};

export {
    loadLfgLocaleMap, getLfgLocaleMap, getLocalizedString, getStrings
};
