import { BotAdmin } from "./bot-admin";
import RegularLfgStarter from "./regular-lfg-starter";
import { LongTermLfg, NormalLfg, RegularLfg } from "./lfg";
import { ServerLfgConfig } from "./server-lfg-config";
import { LongTermLfgUser, NormalLfgUser, RegularLfgUser } from "./lfg-user";

const index = [
    BotAdmin,
    RegularLfgStarter,
    NormalLfg,
    LongTermLfg,
    RegularLfg,
    ServerLfgConfig,
    NormalLfgUser,
    LongTermLfgUser,
    RegularLfgUser
];

export default index;
