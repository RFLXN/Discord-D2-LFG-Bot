interface LfgMessageCreateOption {
    lfgID: number;
    guildID: string;
    channelID: string;
    threadID?: string;
    messageID: string;
    type: "NORMAL" | "THREAD_ROOT";
}

export default LfgMessageCreateOption;
