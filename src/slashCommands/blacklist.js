const {SlashCommandBuilder, AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder, Colors} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Vous permet d\'intéragir avec la blacklist')
        .addSubcommand(
            sub => sub
                .setName('ajouter')
                .setDescription('Vous permet d\'ajouter un identifiant dans la blacklist')
                .addStringOption(
                    opt => opt
                        .setName('identifiant')
                        .setDescription('L\'identifiant que vous voulez insérer dans la blacklist')
                        .setRequired(true)
                        .setMaxLength(22)
                        .setMinLength(17)
                )
                .addStringOption(
                    opt => opt
                        .setName('raison')
                        .setDescription('La raison pour laquelle vous insérez cette identifiant')
                        .setMaxLength(100)
                )
        )
        .addSubcommand(
            sub => sub
                .setName('retirer')
                .setDescription('Vous permet de retirer un identifiant de la blacklist')
                .addStringOption(
                    opt => opt
                        .setName('identifiant')
                        .setDescription('L\'identifiant que vous voulez retirer de la blacklist')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(
            sub => sub
                .setName('info')
                .setDescription(`Permet d'avoir des informations sur un membre blacklist`)
                .addStringOption(
                    opt => opt
                        .setName('identifiant')
                        .setDescription('L\'identifiant que vous voulez retirer de la blacklist')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        ),
    /**
     * @param {BlackListClient} client
     * @param {AutocompleteInteraction} interaction
     */
    async autocomplete(client, interaction){
        const data = await client.database.getAll(-1) || [];
        const focused = interaction.options.getFocused();

        const filter = data
            .filter(x => x.user_id.includes(focused) || x.username.includes(focused))
            .slice(0, 25);

        void interaction.respond(filter.map(x => ({name: `${x.username} (${x.user_id}) | ${x.reason.length > 50 ? x.reason.slice(0, 50) + '...' : x.reason}`, value: x.user_id})));
    },
    /**
     * @param {BlackListClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'ajouter' : {
                const identifiant = interaction.options.getString('identifiant');
                const raison = interaction.options.getString('raison');
                const user = await client.users.fetch(identifiant);

                if (!user)return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription("Cette identifiant ne correspond à aucun utilisateur !")
                    ],
                    ephemeral: true
                });

                if (await client.database.has(identifiant))return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription(`Cet identifiant est déjà dans la blacklist`)
                    ],
                    ephemeral: true
                });

                try {
                    await client.database.AddIfNew(identifiant, {
                        username: user.username,
                        timestamp: Date.now().toString(),
                        reason: raison ? raison : 'Aucune raison définie'
                    });
                } catch (e) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setDescription(`Une erreur s'est produite !\n\n\`${e}\``)
                        ],
                        ephemeral: true
                    });
                }

                void interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Blurple)
                            .setDescription(`L'identifiant **${identifiant}** a été ajouté à la blacklist`)
                    ]
                });

                const guild = await client.guilds.fetch(interaction.guildId);
                const member = await guild.members.fetch(identifiant)
                if (member)
                    await member.ban({
                        reason: "Blacklist | " + raison,
                    })
                        .catch(e => client.log('Erreur lors du bannissement : '.red + e));
            }break;
            case "retirer" : {
                const identifiant = interaction.options.getString('identifiant');

                try {
                    await client.database.remove(identifiant);

                    void interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setDescription(`L'identifiant **${identifiant}** a été retiré de la blacklist`)
                        ]
                    });

                    const guild = await client.guilds.fetch(interaction.guildId);
                    guild.bans.remove(identifiant, 'UnBlacklist').catch(() => {})

                } catch (e) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setDescription(`Une erreur s'est produite !\n\n\`${e}\``)
                        ],
                        ephemeral: true
                    });
                }


            }break;
            case "info" : {
                const identifiant = interaction.options.getString('identifiant');

                try {
                    const bldata = await client.database.get(identifiant);

                    void interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Grey)
                                .setDescription(
                                    `**Information ${bldata.username}**\n` +
                                    `- Identifiant \`${bldata.user_id}\`\n`+
                                    `- Blacklist le <t:${Math.round(bldata.timestamp/1000)}>\n` +
                                    `- Raison: *${bldata.reason}*`
                                )
                        ]
                    });
                } catch (e) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setDescription(`Une erreur s'est produite !\n\n\`${e}\``)
                        ],
                        ephemeral: true
                    });
                }
            }break;
        }
    }
}