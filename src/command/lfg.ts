import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import normalLfgExecutors from "./lfg/normal-lfg";
import longTermLfgExecutors from "./lfg/long-term-lfg";
import regularLfgExecutors from "./lfg/regular-lfg";

const normalLfg: ChatInputApplicationCommandData = {
    name: "lfg",
    nameLocalizations: {
        ko: "파티모집",
        ja: "パーティ募集"
    },
    description: "Looking-For-Group Command",
    descriptionLocalizations: {
        ko: "파티모집 커맨드",
        ja: "パーティ募集に関するコマンド"
    },
    options: [
        {
            name: "create",
            nameLocalizations: {
                ko: "생성",
                ja: "作成"
            },
            description: "Create Looking-For-Group",
            descriptionLocalizations: {
                ko: "파티모집을 생성합니다",
                ja: "パーティ募集を作成します"
            },
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "get-info",
            nameLocalizations: {
                ko: "정보출력",
                ja: "情報出力"
            },
            description: "Get Looking-For-Group Information",
            descriptionLocalizations: {
                ko: "파티모집의 정보를 출력합니다",
                ja: "パーティ募集の情報を出力します"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "Looking-For-Group ID",
                    descriptionLocalizations: {
                        ko: "파티모집 ID",
                        ja: "パーティ募集 ID"
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        },
        {
            name: "delete",
            nameLocalizations: {
                ko: "삭제",
                ja: "削除"
            },
            description: "Delete Looking-For-Group",
            descriptionLocalizations: {
                ko: "파티모집을 삭제합니다",
                ja: "パーティ募集を削除します"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "Looking-For-Group ID",
                    descriptionLocalizations: {
                        ko: "파티모집 ID",
                        ja: "パーティ募集 ID"
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        },
        {
            name: "edit",
            nameLocalizations: {
                ko: "수정",
                ja: "修整"
            },
            description: "Edit Looking-For-Group",
            descriptionLocalizations: {
                ko: "파티모집을 수정합니다",
                ja: "パーティ募集を修整します"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "Looking-For-Group ID",
                    descriptionLocalizations: {
                        ko: "파티모집 ID",
                        ja: "パーティ募集 ID"
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        }
    ]
};

const longTermLfg: ChatInputApplicationCommandData = {
    name: "long-term-lfg",
    nameLocalizations: {
        ko: "장기-파티모집",
        ja: "長期パーティ募集"
    },
    description: "Long-Term Looking-For-Group Command",
    descriptionLocalizations: {
        ko: "장기 파티모집 커맨드",
        ja: "長期パーティ募集に関するコマンド"
    },
    options: [
        {
            name: "create",
            nameLocalizations: {
                ko: "생성",
                ja: "作成"
            },
            description: "Create Long-Term Looking-For-Group",
            descriptionLocalizations: {
                ko: "장기적으로 모집하는 파티모집을 생성합니다",
                ja: "長期的に募集するパーティ募集を作成します"
            },
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "get-info",
            nameLocalizations: {
                ko: "정보출력",
                ja: "情報出力"
            },
            description: "Get Long-Term Looking-For-Group Information",
            descriptionLocalizations: {
                ko: "장기 파티모집의 정보를 출력합니다",
                ja: "長期パーティ募集の情報を出力します"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "Looking-For-Group ID",
                    descriptionLocalizations: {
                        ko: "장기 파티모집 ID",
                        ja: "長期パーティ募集 ID"
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        },
        {
            name: "delete",
            nameLocalizations: {
                ko: "삭제",
                ja: "削除"
            },
            description: "Delete Long-Term Looking-For-Group",
            descriptionLocalizations: {
                ko: "장기 파티모집을 삭제합니다",
                ja: "長期パーティ募集を削除します"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "Long-Term Looking-For-Group ID",
                    descriptionLocalizations: {
                        ko: "장기 파티모집 ID",
                        ja: "長期パーティ募集 ID"
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        },
        {
            name: "edit",
            nameLocalizations: {
                ko: "수정",
                ja: "修整"
            },
            description: "Edit Long-Term Looking-For-Group",
            descriptionLocalizations: {
                ko: "장기 파티모집을 수정합니다",
                ja: "長期パーティ募集を修整します"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "Long-Term Looking-For-Group ID",
                    descriptionLocalizations: {
                        ko: "장기 파티모집 ID",
                        ja: "長期パーティ募集 ID"
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        }
    ]
};

const regularLfg: ChatInputApplicationCommandData = {
    name: "regular-lfg",
    nameLocalizations: {
        ko: "정규-파티모집",
        ja: "定期パーティ募集"
    },
    description: "Regular Looking-For-Group Command",
    descriptionLocalizations: {
        ko: "정규 파티모집 커맨드",
        ja: "定期パーティ募集に関するコマンド"
    },
    options: [
        {
            name: "create",
            nameLocalizations: {
                ko: "생성",
                ja: "作成"
            },
            description: "Create Regular Looking-For-Group",
            descriptionLocalizations: {
                ko: "정기적으로 반복하는 정규 파티모집을 생성합니다",
                ja: "定期的に繰り返す定期パーティ募集を作成します"
            },
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "delete",
            nameLocalizations: {
                ko: "삭제",
                ja: "削除"
            },
            description: "Delete Regular Looking-For-Group",
            descriptionLocalizations: {
                ko: "정규 파티모집을 삭제합니다",
                ja: "定期パーティ募集を削除します"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "Regular Looking-For-Group ID",
                    descriptionLocalizations: {
                        ko: "정규 파티모집 ID",
                        ja: "定期パーティ募集 ID"
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        },
        {
            name: "get-info",
            nameLocalizations: {
                ko: "정보출력",
                ja: "情報出力"
            },
            description: "Get Regular Looking-For-Group Information",
            descriptionLocalizations: {
                ko: "정규 파티모집의 정보를 출력합니다",
                ja: "定期パーティ募集の情報を出力します"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "Looking-For-Group ID",
                    descriptionLocalizations: {
                        ko: "정규 파티모집 ID",
                        ja: "定期パーティ募集 ID"
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        },
        {
            name: "edit",
            nameLocalizations: {
                ko: "수정",
                ja: "修整"
            },
            description: "Edit Regular Looking-For-Group",
            descriptionLocalizations: {
                ko: "정규 파티모집을 수정합니다",
                ja: "定期パーティ募集を修整します"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "Regular Looking-For-Group ID",
                    descriptionLocalizations: {
                        ko: "정규 파티모집 ID",
                        ja: "定期パーティ募集 ID"
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        }
    ]
};

type LfgSubCommandExecutor = (interaction: ChatInputCommandInteraction) => void | Promise<void>;
type LfgSubCommandIdExecutor = (interaction: ChatInputCommandInteraction, lfgId: number) => void | Promise<void>;

interface LfgSubCommandExecutors {
    create: LfgSubCommandExecutor;
    getInfo: LfgSubCommandIdExecutor;
    delete: LfgSubCommandIdExecutor;
    edit: LfgSubCommandIdExecutor;
}

const doSubCommand = async (interaction: ChatInputCommandInteraction, executor: LfgSubCommandExecutors) => {
    const subCommandName = interaction.options.getSubcommand(true);

    if (subCommandName.toLowerCase() == "create") {
        await executor.create(interaction);
    } else {
        const lfgId = interaction.options.getInteger("id", true);

        if (subCommandName.toLowerCase() == "get-info") {
            await executor.getInfo(interaction, lfgId);
        } else if (subCommandName.toLowerCase() == "delete") {
            await executor.delete(interaction, lfgId);
        } else {
            await executor.edit(interaction, lfgId);
        }
    }
};

const doNormalLfg = async (interaction: ChatInputCommandInteraction) => {
    await doSubCommand(interaction, normalLfgExecutors);
};

const doLongTermLfg = async (interaction: ChatInputCommandInteraction) => {
    await doSubCommand(interaction, longTermLfgExecutors);
};

const doRegularLfg = async (interaction: ChatInputCommandInteraction) => {
    await doSubCommand(interaction, regularLfgExecutors);
};

export {
    normalLfg, longTermLfg, regularLfg, doNormalLfg, doLongTermLfg, doRegularLfg,
    LfgSubCommandExecutor, LfgSubCommandIdExecutor, LfgSubCommandExecutors
};
