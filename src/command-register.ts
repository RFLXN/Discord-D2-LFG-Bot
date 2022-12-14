import { Client, REST } from "discord.js";
import { overrideGlobalCommands } from "./command-rest-api";
import commandIndex from "./command";
import messageContextMenuIndex from "./context-menu";
import CommandBuilder from "./type/CommandBuilder";

const registerCommands = async (client: Client, rest: REST) => {
    console.log("Registering Global Commands...");
    const slashCommands = Array.from(commandIndex.map((cmd) => (cmd.data)));
    const messageContextMenus = Array.from(messageContextMenuIndex.map((menu) => menu.data));

    const mixed: CommandBuilder[] = []
        .concat(slashCommands)
        .concat(messageContextMenus);

    await overrideGlobalCommands(
        rest,
        client.application.id,
        mixed
    );
};

export { registerCommands };
