import { createInterface } from "readline";

const rl = createInterface(process.stdin);

const readline = async () => {
    async function* lineGenerator() {
        for await (const line of rl) {
            yield line;
        }
    }

    return (await lineGenerator()
        .next()).value;
};

export default readline;
