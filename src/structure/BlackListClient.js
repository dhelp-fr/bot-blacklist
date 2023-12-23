const {Client, IntentsBitField} = require("discord.js");
const BlackListHandler = require("./Handler");
const config = require("../../config.json");
const BlackListDatabase = require("./Database");

module.exports = class BlackListClient extends Client {

    /**
     * @typedef {config}
     */
    config = config;


    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
            ]
        });
        void this.init()
    }

    async init() {
        console.log("  ██████╗ ██╗  ██╗███████╗██╗     ██████╗ \n  ██╔══██╗██║  ██║██╔════╝██║     ██╔══██╗\n  ██║  ██║███████║█████╗  ██║     ██████╔╝       "+"Version: ".yellow+this.config.developer.version+" \n  ██║  ██║██╔══██║██╔══╝  ██║     ██╔═══╝     "+"Denière Update: ".yellow+this.config.developer.lastUpdate+" \n  ██████╔╝██║  ██║███████╗███████╗██║           "+ "Développeur:".yellow+  " Ifanoxy\n  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     \n");
        this.log("Lancement des handlers...".white);
        this.handler = new BlackListHandler(this);
        this.database = new BlackListDatabase(this);
        this.login(this.config.client.token)
            .then((x) => {
                this.log('En ligne sur '+ this.user.username.blue, 1)
                this.handler.addSlashCommands();
            });
    }
    log(message, tab = 0) {
        console.log("\n".repeat(tab) + "[".grey.bright + "DHelp".magenta.bright + "]".grey.bright, message, "\n".repeat(tab));
    }
}