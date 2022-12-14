import { LfgManager } from "./lfg-manager";

const startRegularLfg = async (lfgID: number) => {
    const lfg = LfgManager.instance.getRegularLfg(lfgID);

    // TODO: IMPLEMENT START REGULAR LFG
};

export default startRegularLfg;
