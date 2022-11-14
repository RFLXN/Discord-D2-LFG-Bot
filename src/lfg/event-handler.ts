import { LfgManager } from "./lfg-manager";
import { NormalLfg } from "../db/entity/lfg";

const appleLfgEventHandlers = () => {
    LfgManager.instance.on("NEW_NORMAL_LFG", async (creator: string, lfg: NormalLfg) => {

        // TODO: IMPLEMENT LOG THREAD CREATION AND LFG LIST APPLY
    });
};

export default appleLfgEventHandlers;
