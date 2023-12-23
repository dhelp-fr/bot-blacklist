const fs = require("fs");
const {Collection, SlashCommandBuilder} = require("discord.js");
const {ApplicationCommandOptionType} = require("discord-api-types/v10");

module.exports = class BlackListHandler {

    /**
     * @private
     * @type {BlackListClient}
     */
    #client;
    /**
     * @type {Collection<String, {data: SlashCommandBuilder, execute: Function, autocomplete?: Function}>}
     */
    #slash_commands;

    /**
     *
     * @param {BlackListClient} client
     */
    constructor(client) {
        this.#client = client;
        this.#slash_commands = new Collection();
        this.#loadSlashCommands();
        this.#loadEvents();
    }

    /**
     *
     * @param {String} path Path of the dir
     * @returns {String[]} Path of all files in directory
     */
    getFiles(path) {
        let files = []
        const rFiles = fs.readdirSync(path);
        for (let rFile of rFiles)
        {
            if (rFile.includes('.'))
            {
                if (!rFile.includes('disabled'))files.push(path + '/' + rFile)
            }
            else files.concat(...this.getFiles(path + "/" + rFile))
        }
        return files;
    }

    #loadSlashCommands() {
        const commandsPath = this.getFiles('src/slashCommands');
        this.#client.log(`Lecture des commandes : `)
        for (let path of commandsPath)
        {
            const dist = require('../../' + path);
            if (!dist?.data?.name) throw new Error(`Missing SlashCommands data (name) in ${path}`);
            if (dist?.data?.options) {
                const x = dist?.data.options.filter(x => !x.type);
                if (x.length > 0) {
                    x.forEach(t => {
                        const y = t.options.filter(x => !x.type);
                        if (y.length > 0)
                            y.forEach(z => this.#client.log(`   - ` + dist.data.name.green + " " + t.name.yellow + " " + z.name.red));
                        else this.#client.log(`   - ` + dist.data.name.green + " " + t.name.yellow)
                    });
                }
            }
            else this.#client.log(`   - ` + dist.data.name.green);
            this.#slash_commands.set(dist.data.name, dist)
        }
    }

    #loadEvents() {
        const eventsPath = this.getFiles('src/events');

        this.#client.log(`Lecture des events : `)
        for (let path of eventsPath)
        {
            const dist = require('../../' + path);
            this.#client.log(`   - ` + dist.name.green)
            this.#client.on(dist.name, (...args) => dist.execute(this.#client, ...args))
        }
    }

    addSlashCommands() {
        this.#client.log('Ajout de ' + this.#slash_commands.size.toString().yellow + ' commandes');
        void this.#client.application.commands.set(this.#slash_commands.map(x => x.data.toJSON()));
    }

    getSlashCommands(name) {
        return this.#slash_commands.get(name);
    }
}