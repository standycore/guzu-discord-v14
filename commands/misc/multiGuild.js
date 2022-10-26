module.exports = {
    isSlashCommand: true,
    name: 'twig',
    description: 'get twogged',
    guilds: ['648728388202397737', '155857659474608128'],
    executable: async ({interaction}) => {
        await interaction.reply('twog');
    }
}