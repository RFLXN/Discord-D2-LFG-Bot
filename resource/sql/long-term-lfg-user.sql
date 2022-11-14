CREATE TABLE LONG_TERM_LFG_USER
(
    ID                         INTEGER PRIMARY KEY AUTOINCREMENT,
    LFG_ID                     TEXT    NOT NULL,
    USER_ID                    TEXT    NOT NULL,
    USER_NAME                  TEXT    NOT NULL,
    USER_TAG                   TEXT    NOT NULL,
    STATE                      TEXT    NOT NULL CHECK ( STATE = 'JOIN' OR STATE = 'ALTER' ),
    STATE_CHANGE_RAW_TIMESTAMP INTEGER NOT NULL,
    FOREIGN KEY (LFG_ID) REFERENCES LONG_TERM_LFG (ID) ON DELETE CASCADE
);
