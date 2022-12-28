import { LfgManager } from "./lfg-manager";
import LfgThreadManager from "./lfg-thread-manager";

const preventThreadArchive = async () => {
    console.log("Send Messages for Prevent Thread Archiving...");

    const normal = LfgManager.instance.getAllNormalLfg();
    const longTerm = LfgManager.instance.getAllLongTermLfg();
    const regular = LfgManager.instance.getAllRegularLfg();

    for (const lfg of normal) {
        console.log(`Send Message for Prevent Thread Archiving: N${lfg.id}`);
        const thread = await LfgThreadManager.instance.getRealNormalThread(lfg.id);
        await thread.send({
            content: "Message for Prevent Thread Archiving."
        });
    }

    for (const lfg of longTerm) {
        console.log(`Send Message for Prevent Thread Archiving: L${lfg.id}`);
        const thread = await LfgThreadManager.instance.getRealLongTermThread(lfg.id);
        await thread.send({
            content: "Message for Prevent Thread Archiving."
        });
    }

    for (const lfg of regular) {
        console.log(`Send Message for Prevent Thread Archiving: R${lfg.id}`);
        const thread = await LfgThreadManager.instance.getRealRegularThread(lfg.id);
        await thread.send({
            content: "Message for Prevent Thread Archiving."
        });
    }
};

export default preventThreadArchive;
