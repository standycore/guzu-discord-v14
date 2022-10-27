const { REST, Routes } = require('discord.js');
const { Global } = require('./global');
require('dotenv/config');
const fs = require('fs');
const { Command } = require('./command');

// for registering slash commands
const rest = new REST({ version: '10' }).setToken(Global.discordToken);



class CommandLoader {
    constructor() {

    }

    static async getLocalCommands(dir) {
        console.log('getting commands from', dir);
        const commandPaths = [];
        let error;
        await new Promise((resolve) => {
            fs.readdir(dir, async (err, files) => {            
                if (err) {
                    error = err;
                    return;
                }
    
                for (const file of files) {
                    const subPath = `${dir}/${file}`
                    if (fs.lstatSync(subPath).isDirectory()) {
                        const subPaths = await this.getLocalCommands(subPath);
                        commandPaths.push(...subPaths);
                    } else if (fs.lstatSync(subPath).isFile()) {
                        commandPaths.push(subPath);
                    }
                }

                resolve();
            });
        })
        
        if (error) {
            console.error(error);
            return [];
        }
        return commandPaths;
    }

    static async loadCommand(path, map) {
        await this.loadCommands([path], map);
    }

    static async loadCommands(paths, map) {
        const currentCommands = {};
        for (const path of paths) {
            const commandOptions = require(path);
            const command = commandOptions instanceof Command ? commandOptions : new Command(commandOptions);
            // set command name to command in the specified map. this is most likely a collection called client.commands
            map.set(command.name, command);
            currentCommands[command.name] = command;
            console.log(`loaded command "${command.name}" from ${path}`);
        }

        // register slash commands
        try {
            const commandsByGuild = {};
            const generalCommands = [];
            Object.values(currentCommands).forEach((command) => {

                if (command.isSlashCommand && command.slashCommandBuilder) {
                    // if length > 0, make it guild specific
                    const json = command.slashCommandBuilder.toJSON();
                    if (command.guilds.length > 0) {
                        command.guilds.forEach((guild) => {
                            if (commandsByGuild[guild] === undefined) {
                                commandsByGuild[guild] = [];
                            }
                            commandsByGuild[guild].push(json);
                        })
                    } else {
                        // general command (available in all guilds)
                        generalCommands.push(json);
                    }
                    
                }
            });
    
            // register guilded slash commands
            for (const [guild, commands] of Object.entries(commandsByGuild)) {
                const data = await rest.put(
                    Routes.applicationGuildCommands(Global.clientId, guild),
                    {
                        body: commands
                    }
                );
                data.forEach((command) => {
                    const guildName = Global.getNameByGuild(command.guild_id) || command.guild_id;
                    console.log(`registered slash command "${command.name}" in guild "${guildName}"`);
                })
            }

            // register general slash commands
            const data = await rest.put(
                Routes.applicationCommands(Global.clientId),
                {
                    body: generalCommands
                }
            );
            data.forEach((command) => {
                console.log(`registered slash command "${command.name}"`);
            })
            
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = { CommandLoader };