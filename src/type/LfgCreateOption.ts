interface BaseLfgCreateOption {
    guildID: string;
    activityName: string;
    description: string;
}

interface DateLfgCreateOption extends BaseLfgCreateOption {
    date: Date;
}

interface LfgCreator {
    userID: string;
    guildID: string;
    userTag: string;
    userName: string;
}

type NormalLfgCreateOption = DateLfgCreateOption;

type LongTermLfgCreateOption = DateLfgCreateOption;

type RegularLfgCreateOption = BaseLfgCreateOption;

export {
    NormalLfgCreateOption, LongTermLfgCreateOption, RegularLfgCreateOption, LfgCreator
};
