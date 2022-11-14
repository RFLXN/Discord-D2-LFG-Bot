interface BaseLfgCreateOption {
    guildID: string;
    activityName: string;
    description: string;
}

interface DateLfgCreateOption extends BaseLfgCreateOption {
    date: Date;
}

type NormalLfgCreateOption = DateLfgCreateOption;

type LongTermLfgCreateOption = DateLfgCreateOption;

type RegularLfgCreateOption = BaseLfgCreateOption;

export { NormalLfgCreateOption, LongTermLfgCreateOption, RegularLfgCreateOption };
