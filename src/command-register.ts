import { Client, REST } from "discord.js";
import { overrideGlobalCommands } from "./command-rest-api.js";
import commandIndex from "./command/index.js";
import messageContextMenuIndex from "./context-menu/index.js";
import CommandBuilder from "./type/CommandBuilder.js";

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
