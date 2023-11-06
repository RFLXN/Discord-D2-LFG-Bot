import { BotAdmin } from "./bot-admin.js";
import RegularLfgStarter from "./regular-lfg-starter.js";
import { LongTermLfg, NormalLfg, RegularLfg } from "./lfg.js";
import { ServerLfgConfig } from "./server-lfg-config.js";
import { LongTermLfgUser, NormalLfgUser, RegularLfgUser } from "./lfg-user.js";
import { LongTermLfgThread, NormalLfgThread, RegularLfgThread } from "./lfg-thread.js";
import { LongTermLfgMessage, NormalLfgMessage, RegularLfgMessage } from "./lfg-message.js";

const index = [
    BotAdmin,
    RegularLfgStarter,
    NormalLfg,
    LongTermLfg,
    RegularLfg,
    ServerLfgConfig,
    NormalLfgUser,
    LongTermLfgUser,
    RegularLfgUser,
    NormalLfgThread,
    LongTermLfgThread,
    RegularLfgThread,
    NormalLfgMessage,
    LongTermLfgMessage,
    RegularLfgMessage
];

export default index;
