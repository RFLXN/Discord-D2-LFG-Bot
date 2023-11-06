import { LongTermLfg, NormalLfg } from "../db/entity/lfg.js";
import AlertedLfg from "../type/AlertedLfg.js";
import { LfgManager } from "./lfg-manager.js";
import LfgThreadManager from "./lfg-thread-manager.js";
import { LfgUserManager } from "./lfg-user-manager.js";
import { LongTermLfgUser, NormalLfgUser } from "../db/entity/lfg-user.js";

let alertedList: AlertedLfg[] = [];

const filterStartSoon = (lfgList: (NormalLfg | LongTermLfg)[]) => {
    const now = new Date().valueOf();

    return lfgList.filter((lfg) => ((lfg.timestamp - now) < (1000 * 60 * 15)) && ((lfg.timestamp - now) > 0));
};

const isAlerted = (type: "NORMAL" | "LONG-TERM", id: number) =>
    !!alertedList.find((alerted) => alerted.type == type && alerted.id == id);

const createMention = (users: (NormalLfgUser | LongTermLfgUser)[]) => {
    let msg = "Looking-For-Party Start Soon.\n";
    users.map((user) => {
        msg += `<@${user.userID}> `;
    });

    return msg;
};

const alertStartSoon = async () => {
    const manager = LfgManager.instance;
    const normal = manager.getAllNormalLfg();
    const longTerm = manager.getAllLongTermLfg();

    const filteredNormal = filterStartSoon(normal);
    const filteredLongTerm = filterStartSoon(longTerm);

    for (const lfg of filteredNormal) {
        if (!isAlerted("NORMAL", lfg.id)) {
            console.log(`Alert Start Soon Normal LFG: ${lfg.id}`);
            const thread = await LfgThreadManager.instance.getRealNormalThread(lfg.id);
            const users = LfgUserManager.instance.getNormalUsers(lfg.id)
                .filter((user) => user.state == "JOIN");
            const message = createMention(users);

            await thread.send({
                content: message
            });

            alertedList.push({
                type: "NORMAL",
                date: new Date(),
                id: lfg.id
            });
        }
    }

    for (const lfg of filteredLongTerm) {
        if (!isAlerted("LONG-TERM", lfg.id)) {
            console.log(`Alert Start Soon Long-Term LFG: ${lfg.id}`);
            const thread = await LfgThreadManager.instance.getRealLongTermThread(lfg.id);
            const users = LfgUserManager.instance.getLongTermUsers(lfg.id)
                .filter((user) => user.state == "JOIN");
            const message = createMention(users);

            await thread.send({
                content: message
            });

            alertedList.push({
                type: "LONG-TERM",
                date: new Date(),
                id: lfg.id
            });
        }
    }
};

const clearAlertedList = () => {
    alertedList = alertedList.filter((alerted) =>
        new Date().valueOf() > alerted.date.valueOf() + (1000 * 60 * 60 * 24));
};

export { alertStartSoon, clearAlertedList };
