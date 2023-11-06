import { dirname, resolve as pathResolve } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import sqlite3Pkg from "sqlite3";
import { isFileExist } from "../util/file.js";
import loadJson from "../util/loadJson.js";

const sqlite3 = sqlite3Pkg.verbose();
type Database = sqlite3Pkg.Database;

const DIR_NAME = dirname(fileURLToPath(import.meta.url));
const SQL_DIR_PATH = pathResolve(DIR_NAME, "../../resource/sql");
const DB_FILE_PATH = pathResolve(DIR_NAME, "../../resource/database.db");
const SEQ_FILE_PATH = pathResolve(DIR_NAME, "../../resource/sql-seq.json");

const connectDB = async (path: string) => new Promise<Database>((resolve, reject) => {
    const db = new sqlite3.Database(path, (err) => {
        if (err) {
            reject(err);
        } else {
            resolve(db);
        }
    });
});

const run = async (db: Database, sql: string) => new Promise<Database>((resolve, reject) => {
    db.run(sql, (err) => {
        if (err) {
            reject(err);
        } else {
            resolve(db);
        }
    });
});

const commit = async (db: Database): Promise<Database> => run(db, "COMMIT");

const beginTransaction = async (db: Database): Promise<Database> => run(db, "BEGIN TRANSACTION");

const close = async (db: Database) => new Promise<void>((resolve, reject) => {
    db.close((err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

const loadSqlSeq = async () => loadJson<string[]>(SEQ_FILE_PATH);

const createDB = async (db: Database) => new Promise<void>(async (resolve) => {
    console.log("Creating DB...");

    const seq = await loadSqlSeq();
    console.log(`Every '${seq.length}' SQL Files.`);
    console.log(seq);

    db.serialize(async () => {
        await run(db, "PRAGMA foreign_keys = 1;");

        for (const fileName of seq) {
            console.log(`Run SQL: ${fileName}`);
            try {
                const path = pathResolve(SQL_DIR_PATH, fileName);
                const file = await fs.readFile(path, {
                    encoding: "utf-8",
                    flag: "r"
                });
                const sql = file.toString();
                await beginTransaction(db);
                await run(db, sql);
                await commit(db);

                console.log(`SQL '${fileName}' Committed.`);
            } catch (e) {
                console.error(e);
                console.error(`Failed to Run SQL: ${fileName}`);
            }
        }

        await close(db);
        console.log("DB File Successfully Created.");
        resolve();
    });
});

const sqliteInit = async () => {
    console.log("Initializing SQLite DB...");
    console.log("Check DB File.");
    if (!(await isFileExist(DB_FILE_PATH))) {
        console.log("DB File Not Exist.");
        await createDB(await connectDB(DB_FILE_PATH));
    } else {
        console.log("DB File Exist.");
    }
    console.log("SQLite DB Initializing Complete.");
};

export default sqliteInit;
export { DB_FILE_PATH };
