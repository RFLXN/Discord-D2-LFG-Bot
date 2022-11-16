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
    needInitLfgServerConfig: string
}

type BaseLfgLocaleMap = Partial<Record<LocaleString, LfgLocaleMapElements>>;

interface LfgLocaleMap extends BaseLfgLocaleMap {
    default: LfgLocaleMapElements;
}

export { LfgLocaleMap, LfgLocaleMapElements };
