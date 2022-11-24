import { getQueryBuilder, getRepository } from "./db/typeorm";
import { BotAdmin } from "./db/entity/bot-admin";
import { getInfo } from "./bot-info";

const getBotAdmins = async (): Promise<BotAdmin[]> => {
    console.log("Querying All Bot Administrators.");
    const queried = await getRepository(BotAdmin)
        .find();
    console.log("Bot Administrators Successfully Queried.");
    return queried;
};

const isOwner = async (userID: string): Promise<boolean> => userID == (await getInfo()).owner;

const isAdmin = async (userID: string): Promise<boolean> => {
    console.log(`Checking '${userID}' is Bot Administrator.`);
    if (await isOwner(userID)) {
        console.log(`'${userID}' is Administrator?: ${true}`);
        return true;
    }
    const admins = await getBotAdmins();
    const found = admins.find((admin) => admin.userID == userID);
    console.log(`'${userID}' is Administrator?: ${!!found}`);
    return !!found;
};

const insertBotAdmin = async (userID: string) => {
    if (await isAdmin(userID)) {
        throw new Error(`${userID} is Already Bot Administrator.`);
    }

    console.log(`Inserting Bot Administrator: ${userID}`);
    await getQueryBuilder(BotAdmin)
        .insert()
        .into(BotAdmin)
        .values([
            { userID }
        ])
        .execute();
    console.log(`'${userID} is Successfully Added to Bot Administrator.'`);
};

const deleteBotAdmin = async (userID: string) => {
    if (!(await isAdmin(userID))) {
        throw new Error(`${userID} is Not a Bot Administrator.`);
    }

    if (await isOwner(userID)) {
        throw new Error("Bot Owner Can't Delete from Bot Administrator.");
    }

    console.log(`Deleting Bot Administrator: ${userID}`);
    await getQueryBuilder(BotAdmin)
        .delete()
        .from(BotAdmin)
        .where("USER_ID = :userID", { userID })
        .execute();
    console.log(`Successfully Deleted '${userID}' from Bot Administrator.`);
};

export { insertBotAdmin, deleteBotAdmin, isAdmin };
