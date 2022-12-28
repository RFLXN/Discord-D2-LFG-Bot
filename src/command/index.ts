import {
    ApplicationCommandNumericOptionData,
    ApplicationCommandOptionData,
    ApplicationCommandOptionType,
    ApplicationCommandStringOptionData,
    ApplicationCommandSubCommandData,
    ChatInputApplicationCommandData,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder
} from "discord.js";
import {
    doLongTermLfg, doNormalLfg, doRegularLfg, longTermLfg, normalLfg, regularLfg
} from "./lfg";
import { doServerAdmin, serverAdmin } from "./server-admin";
import { botAdmin, doBotAdmin } from "./bot-admin";
import CommandIndex from "../type/CommandIndex";
import { doGitHub, github } from "./github";

const convertOptionDataToBuilder = (option: ApplicationCommandOptionData) => {
    if (option.type == ApplicationCommandOptionType.Subcommand) {
        const typedOption = option as ApplicationCommandSubCommandData;
        const builder = new SlashCommandSubcommandBuilder();

        builder.setName(typedOption.name)
            .setDescription(typedOption.description);

        if (typedOption.nameLocalizations) {
            builder.setNameLocalizations(typedOption.nameLocalizations);
        }

        if (typedOption.descriptionLocalizations) {
            builder.setDescriptionLocalizations(typedOption.descriptionLocalizations);
        }

        if (typedOption.options) {
            for (const subOption of typedOption.options) {
                const convertedSubOption = convertOptionDataToBuilder(subOption);
                if (subOption.type == ApplicationCommandOptionType.String) {
                    builder.addStringOption(convertedSubOption as SlashCommandStringOption);
                } else if (subOption.type == ApplicationCommandOptionType.Integer) {
                    builder.addIntegerOption(convertedSubOption as SlashCommandIntegerOption);
                }
            }
        }

        return builder;
    }
    if (option.type == ApplicationCommandOptionType.String) {
        const typedOption = option as ApplicationCommandStringOptionData;
        const builder = new SlashCommandStringOption();

        builder.setName(typedOption.name)
            .setDescription(typedOption.description);

        if (typedOption.nameLocalizations) {
            builder.setNameLocalizations(typedOption.nameLocalizations);
        }

        if (typedOption.descriptionLocalizations) {
            builder.setDescriptionLocalizations(typedOption.descriptionLocalizations);
        }

        if (typedOption.choices) {
            builder.setChoices(...typedOption.choices);
        }

        if (typeof typedOption.autocomplete != "undefined") {
            builder.setAutocomplete(typedOption.autocomplete);
        }

        if (typeof typedOption.required != "undefined") {
            builder.setRequired(typedOption.required);
        }

        return builder;
    }
    if (option.type == ApplicationCommandOptionType.Integer) {
        const typedOption = option as ApplicationCommandNumericOptionData;
        const builder = new SlashCommandIntegerOption();

        builder.setName(typedOption.name)
            .setDescription(typedOption.description);

        if (typedOption.nameLocalizations) {
            builder.setNameLocalizations(typedOption.nameLocalizations);
        }

        if (typedOption.descriptionLocalizations) {
            builder.setDescriptionLocalizations(typedOption.descriptionLocalizations);
        }

        if (typedOption.choices) {
            builder.setChoices(...typedOption.choices);
        }

        if (typeof typedOption.autocomplete != "undefined") {
            builder.setAutocomplete(typedOption.autocomplete);
        }

        if (typeof typedOption.required != "undefined") {
            builder.setRequired(typedOption.required);
        }

        return builder;
    }
};

const convertCommandDataToBuilder = (data: ChatInputApplicationCommandData): SlashCommandBuilder => {
    const builder = new SlashCommandBuilder();

    // Required Fields
    builder
        .setName(data.name)
        .setDescription(data.description);

    // Optional Fields
    if (data.nameLocalizations) {
        builder.setNameLocalizations(data.nameLocalizations);
    }

    if (data.descriptionLocalizations) {
        builder.setDescriptionLocalizations(data.descriptionLocalizations);
    }

    // Options
    if (!!data.options && data.options.length > 0) {
        for (const option of data.options) {
            const convertedOption = convertOptionDataToBuilder(option);
            if (option.type == ApplicationCommandOptionType.Subcommand) {
                builder.addSubcommand(convertedOption as SlashCommandSubcommandBuilder);
            } else if (option.type == ApplicationCommandOptionType.String) {
                builder.addStringOption(convertedOption as SlashCommandStringOption);
            } else if (option.type == ApplicationCommandOptionType.Integer) {
                builder.addIntegerOption(convertedOption as SlashCommandIntegerOption);
            }
        }
    }

    return builder;
};

const index: CommandIndex[] = [
    {
        data: convertCommandDataToBuilder(normalLfg),
        exec: doNormalLfg
    },
    {
        data: convertCommandDataToBuilder(longTermLfg),
        exec: doLongTermLfg
    },
    {
        data: convertCommandDataToBuilder(regularLfg),
        exec: doRegularLfg
    },
    {
        data: convertCommandDataToBuilder(serverAdmin),
        exec: doServerAdmin
    },
    {
        data: convertCommandDataToBuilder(botAdmin),
        exec: doBotAdmin
    },
    {
        data: convertCommandDataToBuilder(github),
        exec: doGitHub
    }
];

export default index;
