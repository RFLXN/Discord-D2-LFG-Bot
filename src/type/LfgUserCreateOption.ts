interface LfgUserCreateOption {
    lfgID: number;
    userID: string;
    userName: string;
    userTag: string;
}

type NormalLfgUserCreateOption = LfgUserCreateOption;

type LongTermLfgUserCreateOption = LfgUserCreateOption;

type RegularLfgUserCreateOption = LfgUserCreateOption;

export { NormalLfgUserCreateOption, LongTermLfgUserCreateOption, RegularLfgUserCreateOption };
