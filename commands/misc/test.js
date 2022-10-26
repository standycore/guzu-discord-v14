module.exports = {
    isSlashCommand: true,
    name: 'test',
    description: 'get tested',
    executable: async ({interaction}) => {
        await interaction.reply('tost');
    }
}