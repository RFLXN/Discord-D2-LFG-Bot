import { ButtonInteraction } from "discord.js";

type LfgAction = "join" | "alter" | "leave";
type LfgType = "normal" | "longterm" | "regular";

const doNormal = async (interaction: ButtonInteraction, lfgID: number, action: LfgAction) => {

};

const doLongTerm = async (interaction: ButtonInteraction, lfgID: number, action: LfgAction) => {

};

const doRegular = async (interaction: ButtonInteraction, lfgID: number, action: LfgAction) => {

};

const handleButton = async (interaction: ButtonInteraction) => {
    const token = interaction.customId.replace("lfg-", "")
        .split("-");
    const type = token[0] as LfgType;
    const lfgID = Number(token[1]);
    const action = token[2] as LfgAction;

    if (type == "normal") {
        await doNormal(interaction, lfgID, action);
    } else if (type == "longterm") {
        await doLongTerm(interaction, lfgID, action);
    } else {
        await doRegular(interaction, lfgID, action);
    }
};

export { handleButton };
