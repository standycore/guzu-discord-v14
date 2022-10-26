const guildIdToName = {
    '155857659474608128': 'test',
    '648728388202397737': 'shed'
}

const guildNameToId = {}

class Global {
    constructor() {

    }

    static refreshGuildMaps() {
        Object.entries(guildIdToName).forEach(([key, value]) => {
            guildNameToId[value] = key;
        })
    }

    static getGuildByName(name) {
        return guildNameToId[name];
    }

    static getNameByGuild(guild) {
        return guildNameToId[guild];
    }
}

Global.refreshGuildMaps();

module.exports = { Global };