import { LfgManager } from "./lfg-manager";
import { getLfgServerConfig } from "./server-config";
import { LongTermLfg, NormalLfg } from "../db/entity/lfg";

const filterExpired = (lfgList: (NormalLfg | LongTermLfg)[]) => lfgList.filter((lfg) => {
    const delay = getLfgServerConfig(lfg.guildID).expiredLfgDeleteDelay;

    if (!delay) return false;

    const now = new Date().valueOf();

    return now > (lfg.timestamp + delay);
});
const collectExpiredLfg = async () => {
    console.log("Trying to Collect Expired LFG.");

    const manager = LfgManager.instance;
    const normal = manager.getAllNormalLfg();
    const longTerm = manager.getAllLongTermLfg();

    const normalExpired = filterExpired(normal);
    const longTermExpired = filterExpired(longTerm);

    if (normalExpired.length + longTermExpired.length == 0) {
        console.log("There is No Expired LFG.");
        return;
    }

    console.log(`Every Expired '${normalExpired.length}' Normal / '${longTermExpired.length}' Long-Term LFGs.`);

    for (const lfg of normalExpired) {
        console.log(`Delete Expired Normal LFG: ${lfg.id}`);

        const result = manager.deleteNormalLfg(lfg.id);

        if (result) {
            console.log(`Expired Normal LFG Successfully Deleted: ${lfg.id}`);
        } else {
            console.log(`Failed to Delete Expired Normal LFG: ${lfg.id}`);
        }
    }

    for (const lfg of longTermExpired) {
        console.log(`Delete Expired Long-Term LFG: ${lfg.id}`);

        const result = manager.deleteLongTermLfg(lfg.id);

        if (result) {
            console.log(`Expired Long-Term LFG Successfully Deleted: ${lfg.id}`);
        } else {
            console.log(`Failed to Delete Expired Long-Term LFG: ${lfg.id}`);
        }
    }
};

export default collectExpiredLfg;
