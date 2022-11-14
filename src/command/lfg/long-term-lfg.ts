import { ChatInputCommandInteraction } from "discord.js";
import { LfgSubCommandExecutor, LfgSubCommandExecutors, LfgSubCommandIdExecutor } from "../lfg";

const doCreate: LfgSubCommandExecutor = async (interaction: ChatInputCommandInteraction) => {

};

const doGetInfo: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgId: number) => {

};

const doDelete: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgId: number) => {

};

const doEdit: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgId: number) => {

};

const longTermLfgExecutors: LfgSubCommandExecutors = {
    create: doCreate,
    getInfo: doGetInfo,
    delete: doDelete,
    edit: doEdit
};

export default longTermLfgExecutors;
