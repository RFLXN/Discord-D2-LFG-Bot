import { EventTypes, TypedEventEmitter } from "../util/event-emitter";
import { LfgManager } from "./lfg-manager";

type LfgThreadEvents = EventTypes;

class LfgThreadManager extends TypedEventEmitter<LfgThreadEvents> {
    private static readonly singleton = new LfgThreadManager();

    private normalThreads: string[] = [];

    private longTermThreads: string[] = [];

    private regularThreads: string[] = [];

    private constructor() {
        super();
    }

    public static get instance() {
        return this.singleton;
    }

    public async createNormalThread(lfgID: number) {
        const lfg = LfgManager.instance.getNormalLfg(lfgID);
    }

    public async createLongTermThread(lfgID: number) {

    }

    public async createRegularThread(lfgID: number) {

    }
}
