import { LongTermLfg, NormalLfg, RegularLfg } from "../db/entity/lfg";
import { LfgCreator } from "../type/LfgCreateOption";
import { LfgUserManager } from "./lfg-user-manager";
import { LfgManager } from "./lfg-manager";
import LfgThreadManager from "./lfg-thread-manager";
import { LfgMessageManager } from "./lfg-message-manager";

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
    const {
        entity,
        real
    } = await threadManager.createNormalThread(lfg.id);
    await real.send({
        content: threadManager.createThreadInitMessage("NORMAL", lfg, creator.userID)
    });

    const messageManager = LfgMessageManager.instance;
    const message = await real.send({
        embeds: [messageManager.createMessageEmbed({
            locale: "default",
            thread: entity,
            lfg,
            users: userManager.getNormalUsers(lfg.id),
            type: "NORMAL"
        })],
        components: [messageManager.createMessageButton("NORMAL", lfg.id, "default")]
    });

    await LfgMessageManager.instance.createNormalMessage({
        lfgID: lfg.id,
        guildID: message.guild.id,
        channelID: message.channel.parent.id,
        threadID: message.channel.id,
        type: "THREAD_ROOT",
        messageID: message.id
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
    const {
        entity,
        real
    } = await threadManager.createLongTermThread(lfg.id);
    await real.send({
        content: threadManager.createThreadInitMessage("LONG-TERM", lfg, creator.userID)
    });

    const messageManager = LfgMessageManager.instance;
    const message = await real.send({
        embeds: [messageManager.createMessageEmbed({
            locale: "default",
            thread: entity,
            lfg,
            users: userManager.getLongTermUsers(lfg.id),
            type: "LONG-TERM"
        })],
        components: [messageManager.createMessageButton("LONG-TERM", lfg.id, "default")]
    });

    await LfgMessageManager.instance.createLongTermMessage({
        lfgID: lfg.id,
        guildID: message.guild.id,
        channelID: message.channel.parent.id,
        threadID: message.channel.id,
        type: "THREAD_ROOT",
        messageID: message.id
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
    const {
        entity,
        real
    } = await threadManager.createRegularThread(lfg.id);
    await real.send({
        content: threadManager.createThreadInitMessage("REGULAR", lfg, creator.userID)
    });

    const messageManager = LfgMessageManager.instance;
    const message = await real.send({
        embeds: [messageManager.createMessageEmbed({
            locale: "default",
            thread: entity,
            lfg,
            users: userManager.getRegularUsers(lfg.id),
            type: "REGULAR"
        })],
        components: [messageManager.createMessageButton("REGULAR", lfg.id, "default")]
    });

    await LfgMessageManager.instance.createRegularMessage({
        lfgID: lfg.id,
        guildID: message.guild.id,
        channelID: message.channel.parent.id,
        threadID: message.channel.id,
        type: "THREAD_ROOT",
        messageID: message.id
    });
};

const applyEventHandlers = () => {
    LfgManager.instance.typedOn("NEW_NORMAL_LFG", newNormalLfgHandler);
    LfgManager.instance.typedOn("NEW_LONG_TERM_LFG", newLongTermLfgHandler);
    LfgManager.instance.typedOn("NEW_REGULAR_LFG", newRegularLfgHandler);
};

export default applyEventHandlers;
