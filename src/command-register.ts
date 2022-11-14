import { Client, REST } from "discord.js";
import { overrideGlobalCommands } from "./command-rest-api";
import index from "./command";

const registerCommands = async (client: Client, rest: REST) => {
    console.log("Registering Global Commands...");
    await overrideGlobalCommands(
        rest,
        client.application.id,
        Array.from(index.map((cmd) => (cmd.data)))
    );
};

export { registerCommands };
