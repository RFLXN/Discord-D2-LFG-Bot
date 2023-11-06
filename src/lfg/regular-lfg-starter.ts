import RegularLfgStarter from "../db/entity/regular-lfg-starter.js";
import { getQueryBuilder, getRepository } from "../db/typeorm.js";

let starters: RegularLfgStarter[] = [];

const loadStarters = async () => {
    console.log("Load All Regular LFG Starters...");
    starters = await getRepository(RegularLfgStarter)
        .createQueryBuilder()
        .getMany();
    console.log(`Regular LFG Starters Loaded. (Every '${starters.length}' Starters)`);
};

const getStarterFromDB = async (
    userID: string,
    guildID: string
): Promise<RegularLfgStarter> => {
    console.log(`Querying Regular LFG Starter... (User ID: ${userID} / Guild ID: ${guildID})`);
    const result = await getRepository(RegularLfgStarter)
        .createQueryBuilder("REGULAR_LFG_STARTER")
        .where("REGULAR_LFG_STARTER.USER_ID = :userID AND REGULAR_LFG_STARTER.GUILD_ID = :guildID", {
            userID,
            guildID
        })
        .getOne();
    console.log(`Querying Complete. (PK ID: ${result.id})`);
    return result;
};

const addStarterToDB = async (userID: string, guildID: string): Promise<RegularLfgStarter> => {
    console.log(`Inserting Regular LFG Starter... (User ID: ${userID} / Guild ID: ${guildID})`);
    await getQueryBuilder()
        .insert()
        .into(RegularLfgStarter)
        .values([
            {
                userID,
                guildID
            }
        ])
        .execute();

    const inserted = await getStarterFromDB(userID, guildID);
    console.log(`Inserting Complete. (PK ID: ${inserted.id})`);

    return inserted;
};

const deleteStarterFromDB = async (userID: string, guildID: string): Promise<boolean> => {
    console.log(`Deleting Regular LFG Starter... (User ID: ${userID} / Guild ID: ${guildID})`);
    const result = await getQueryBuilder()
        .delete()
        .from(RegularLfgStarter)
        .where("USER_ID = :userID AND GUILD_ID = :guildID", {
            userID,
            guildID
        })
        .execute();
    if (result.affected < 1) {
        console.log(`Failed to Delete. User ID: ${userID} / Guild ID: ${guildID} is Not Exist.`);
        return false;
    }
    console.log(`Deleting Complete. (User ID: ${userID} / Guild ID: ${guildID})`);
    return true;
};

const deleteStarterFromCache = (userID: string, guildID: string): boolean => {
    const idx = starters.findIndex((starter) => starter.userID == userID && starter.guildID == guildID);

    if (idx == -1) {
        return false;
    }

    starters.splice(idx, 1);

    return true;
};

const isStarter = (userID: string, guildID: string): boolean => {
    const found = starters.find((starter) => starter.userID == userID && starter.guildID == guildID);
    return !!found;
};

const addStarter = async (userID: string, guildID: string): Promise<boolean> => {
    if (isStarter(userID, guildID)) {
        return false;
    }

    try {
        const result = await addStarterToDB(userID, guildID);
        starters.push(result);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const deleteStarter = (userID: string, guildID: string): boolean => {
    if (!isStarter(userID, guildID)) return false;
    deleteStarterFromDB(userID, guildID);
    deleteStarterFromCache(userID, guildID);
    return true;
};

export {
    loadStarters, isStarter, addStarter, deleteStarter
};
