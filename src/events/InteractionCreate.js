const {Events, BaseInteraction} = require("discord.js");
module.exports = {
    name: Events.InteractionCreate,
    /**
     *
     * @param {BlackListClient} client
     * @param {BaseInteraction} interaction
     */
    execute(client, interaction)
    {
        if (interaction.isChatInputCommand() || interaction.isAutocomplete())
        {
            const command = client.handler.getSlashCommands(interaction.commandName);
            (interaction.isAutocomplete() ? command.autocomplete : command.execute)(client, interaction);
        }
    }
}