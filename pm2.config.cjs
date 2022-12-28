module.exports = {
    apps: [
        {
            name: "DiscordD2LfgBot",
            script: "run start",
            interpreter: "/usr/bin/bash",
            cwd: "/home/ubuntu/Discord-D2-LFG-Bot/",
            log_date_format: "YYYY-MM-DD HH:mm Z",
            error_file: "/home/ubuntu/Discord-D2-LFG-Bot/logs/error.log",
            out_file: "/home/ubuntu/Discord-D2-LFG-Bot/logs/out.log"
        }
    ]
};
