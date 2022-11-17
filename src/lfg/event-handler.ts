import { LongTermLfg, NormalLfg, RegularLfg } from "../db/entity/lfg";
import { LfgCreator } from "../type/LfgCreateOption";
import { LfgUserManager } from "./lfg-user-manager";
import { LfgManager } from "./lfg-manager";
import LfgThreadManager from "./lfg-thread-manager";

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

    const threadManager = LfgThreadManager.instance;
    const thread = await threadManager.createNormalThread(lfg.id);
    await thread.send({
        content: threadManager.createThreadInitMessage("NORMAL", lfg, creator.userID)
    });
};

const newLongTermLfgHandler = async (creator: LfgCreator, lfg: LongTermLfg) => {
    const userManager = LfgUserManager.instance;
    await userManager.newLongTermCreator({
        lfgID: lfg.id,
        ...creator
    });
    await userManager.joinLongTermUser({
        lfgID: lfg.id,
        ...creator
    });

    const threadManager = LfgThreadManager.instance;
    const thread = await threadManager.createLongTermThread(lfg.id);
    await thread.send({
        content: threadManager.createThreadInitMessage("LONG-TERM", lfg, creator.userID)
    });
};

const newRegularLfgHandler = async (creator: LfgCreator, lfg: RegularLfg) => {
    const userManager = LfgUserManager.instance;
    await userManager.newRegularCreator({
        lfgID: lfg.id,
        ...creator
    });
    await userManager.joinRegularUser({
        lfgID: lfg.id,
        ...creator
    });

    const threadManager = LfgThreadManager.instance;
    const thread = await threadManager.createRegularThread(lfg.id);
    await thread.send({
        content: threadManager.createThreadInitMessage("REGULAR", lfg, creator.userID)
    });
};

const applyEventHandlers = () => {
    LfgManager.instance.typedOn("NEW_NORMAL_LFG", newNormalLfgHandler);
    LfgManager.instance.typedOn("NEW_LONG_TERM_LFG", newLongTermLfgHandler);
    LfgManager.instance.typedOn("NEW_REGULAR_LFG", newRegularLfgHandler);
};

export default applyEventHandlers;
