import { LocaleString } from "discord-api-types/v10";

interface LfgLocaleMapElements {
    activityCreateSelectionTitle: string,
    activityEditSelectionTitle: string,
    activitySelectionDescription: string,
    activitySelectMenuPlaceholder: string,
    modalCreateTitle: string,
    modalEditTitle: string,
    modalDescriptionInput: string,
    modalDateInput: string,
    modalDateInputDescription: string,
    waitingLfgCreationMessage: string,
    lfgCreationCompleteMessage: string,
    needInitLfgServerConfig: string,
    normalLfg: string,
    longTermLfg: string,
    regularLfg: string,
    description: string,
    creator: string,
    datetime: string,
    activity: string,
    join: string,
    alter: string,
    leave: string,
    pleaseInputDescription: string,
    notJoined: string,
    leaved: string,
    alreadyJoined: string,
    joined: string,
    alreadyAltered: string,
    altered: string,
    invalidLfg: string,
    needPermissionToDeleteLfg: string,
    checkDeletion: string,
    cancelDeletion: string,
    lfgDeleted: string,
    failedToDeleteLfg: string
}

type BaseLfgLocaleMap = Partial<Record<LocaleString, LfgLocaleMapElements>>;

interface LfgLocaleMap extends BaseLfgLocaleMap {
    default: LfgLocaleMapElements;
}

export { LfgLocaleMap, LfgLocaleMapElements };
