import { LongTermLfg, NormalLfg, RegularLfg } from "../db/entity/lfg";
import { LfgCreator } from "../type/LfgCreateOption";
import { LfgUserManager } from "./lfg-user-manager";
import { LfgManager } from "./lfg-manager";

const newNormalLfgHandler = async (creator: LfgCreator, lfg: NormalLfg) => {
    const userManager = LfgUserManager.instance;
    await userManager.newNormalCreator({
        lfgID: lfg.id,
        ...creator
    });
    await userManager.joinNormalUser({
        lfgID: lfg.id,
        ...creator
    });
};

const newLongTermLfgHandler = async (creator: LfgCreator, lfg: LongTermLfg) => {

};

const newRegularLfgHandler = async (creator: LfgCreator, lfg: RegularLfg) => {

};

const applyEventHandlers = () => {
    LfgManager.instance.typedOn("NEW_NORMAL_LFG", newNormalLfgHandler);
    LfgManager.instance.typedOn("NEW_LONG_TERM_LFG", newLongTermLfgHandler);
    LfgManager.instance.typedOn("NEW_REGULAR_LFG", newRegularLfgHandler);
};

export default applyEventHandlers;
