import { AutocompleteInteraction } from "discord.js";
import { LfgManager } from "../lfg/lfg-manager";

const doLfgAutoComplete = async (interaction: AutocompleteInteraction) => {
    console.log("hadle");
    await interaction.respond(LfgManager.instance.getAllNormalLfg()
        .map((lfg) => ({
            name: `${lfg.id} - ${lfg.activityName}`,
            value: lfg.id
        })));
};

const doLongTermLfgAutoComplete = async (interaction: AutocompleteInteraction) => {
    await interaction.respond(LfgManager.instance.getAllLongTermLfg()
        .map((lfg) => ({
            name: `${lfg.id} - ${lfg.activityName}`,
            value: lfg.id
        })));
};

const doRegularLfgAutoComplete = async (interaction: AutocompleteInteraction) => {
    await interaction.respond(LfgManager.instance.getAllRegularLfg()
        .map((lfg) => ({
            name: `${lfg.id} - ${lfg.activityName}`,
            value: lfg.id
        })));
};

export { doLfgAutoComplete, doRegularLfgAutoComplete, doLongTermLfgAutoComplete };
