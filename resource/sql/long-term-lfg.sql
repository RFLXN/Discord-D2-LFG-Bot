CREATE TABLE LONG_TERM_LFG
(
    ID            INTEGER PRIMARY KEY AUTOINCREMENT,
    GUILD_ID      TEXT    NOT NULL,
    ACTIVITY_NAME TEXT    NOT NULL,
    DESCRIPTION   TEXT    NOT NULL,
    RAW_TIMESTAMP INTEGER NOT NULL
);
