module.exports = {
    isSlashCommand: true,
    name: 'grig',
    description: 'get grogged',
    guild: '648728388202397737',
    executable: async ({interaction}) => {
        await interaction.reply('grog');
    }
}