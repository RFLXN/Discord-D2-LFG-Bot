import { LocaleString } from "discord-api-types/v10";

interface LfgActivityNode {
    name: string;
    localizationName: Partial<Record<LocaleString, string>>;
}

type LfgActivityMap = LfgActivityNode[];

export default LfgActivityMap;
export { LfgActivityNode };
