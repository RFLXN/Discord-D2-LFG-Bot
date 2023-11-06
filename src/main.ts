import {
    Client, Events, IntentsBitField, REST
} from "discord.js";

import { onInteractionCreate, onReady } from "./client-event-handler.js";
import { applyOwner, applyToken, getInfo } from "./bot-info.js";
import readline from "./util/readline.js";
import { disconnectDB } from "./db/typeorm.js";

console.log("Starting Destiny 2 LFG Discord Bot...");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

client.on(Events.ClientReady, onReady);
client.on(Events.InteractionCreate, onInteractionCreate);

const rest = new REST({ version: "10" });

const setToken = async () => {
    let token: void | string;

    while (true) {
        console.log("Please Type Token:");
        token = await readline();
        if (token) break;
        console.log("Invalid Token. Type Again.");
    }

    await applyToken(token as string);
};

const setOwner = async () => {
    let owner: void | string;

    while (true) {
        console.log("Please Type Owner ID:");
        owner = await readline();
        if (owner) break;
        console.log("Invalid Owner ID. Type Again.");
    }

    await applyOwner(owner as string);
};

const login = async () => {
    try {
        const info = await getInfo();
        rest.setToken(info.token);
        await client.login(info.token);
    } catch (e) {
        console.error(e);

        console.log("Failed to Login.");
        console.log("If You Want To Change Token, Type 'y' Please.");

        const check = await readline();

        if (check == "y") {
            await setToken();
            await login();
        } else {
            console.log("Stop Discord Bot.");
            process.exit(1);
        }
    }
};

if ((await getInfo()).token == "") {
    console.log("Discord Bot Token Not Set.");
    await setToken();
}

if ((await getInfo()).owner == "") {
    console.log("Discord Bot Owner Not Set.");
    await setOwner();
}

await login();

process.on("exit", async () => {
    await disconnectDB();
});

export default client;
export { rest };
