import { promises as fs } from "fs";

console.log("Clearing 'dist' Directory...");

(async () => {
    try {
        await fs.rm("dist", { recursive: true });
        await fs.mkdir("dist");
        console.log("'dist' Directory Successfully Cleared!");
    } catch (e) {
        console.log(e);
    }
})();
