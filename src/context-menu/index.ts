import { doRegularLfgStart, regularLfgStart } from "./regular-lfg-start";
import MessageContextMenuIndex from "../type/MessasgeContextMenuIndex";

const index: MessageContextMenuIndex[] = [
    {
        data: regularLfgStart,
        exec: doRegularLfgStart
    }
];

export default index;
