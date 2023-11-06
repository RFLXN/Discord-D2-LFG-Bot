import { doRegularLfgStart, regularLfgStart } from "./regular-lfg-start.js";
import MessageContextMenuIndex from "../type/MessasgeContextMenuIndex.js";

const index: MessageContextMenuIndex[] = [
    {
        data: regularLfgStart,
        exec: doRegularLfgStart
    }
];

export default index;
