const {Events, } = require("discord.js");
module.exports = {
    name: Events.GuildMemberAdd,
    /**
     *
     * @param {BlackListClient} client
     * @param {GuildMember} member
     */
    async execute(client, member) {
        if (await client.database.has(member.id)) {
            await member.ban({
                reason: 'BlackList'
            })
                .catch(e => client.log('Erreur lors du bannissement : '.red + e));
        }
    }
}