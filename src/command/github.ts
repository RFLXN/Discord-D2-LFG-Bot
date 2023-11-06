import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";

const GITHUB_URL = "https://github.com/RFLXN/Discord-D2-LFG-Bot";

const github: ChatInputApplicationCommandData = {
    name: "github",
    description: "Bot Source Code Github URL"
};

const doGitHub = async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
        content: `Github URL: ${GITHUB_URL}`
    });
};

export { github, doGitHub };
