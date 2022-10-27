const { SlashCommandBuilder } = require('discord.js');

class Command {
    constructor(options = {}) {
        this.options = options;
        this.isSlashCommand = options.isSlashCommand !== undefined ? options.isSlashCommand : false;
        
        // array of allowed guilds. if empty, allow everywhere
        this.guilds = options.guilds || (options.guild !== undefined ? [options.guild] : []);

        // function that is called when this is executed. should be async
        this.executable = options.executable || options.execute || options.callback;

        this.name = options.name;
        this.enforcedName = enforceCharacters(this.name);
        this.description = options.description || 'no description';
        // can be called in dm
        this.ephemeral = (options.DMPermission !== undefined ? options.DMPermission : undefined) || 
        (options.ephemeral !== undefined ? options.ephemeral : undefined) || false;

        const tempArgs = options.options || options.args || [];
        
        this.args = [];

        // option name to array of autocomplete choices (as strings);
        this.autocompleteChoices = {};

        // fix args to options format {name, desc, type} object
        // type should be guaranteed inside addOptionFunctionName[arg.type]
        // name and desc should be string
        // name should only have a-z
        tempArgs.forEach((arg) => {
            
            if (!(arg instanceof Object)) {
                // enforces characters in allowedOptionNameCharacters
                const name = enforceCharacters(arg);

                // creates option and pushes it
                const option = {
                    name: `${name}`,
                    description: `${arg}`,
                    type: 'string'
                }
                this.args.push(option);
            } else {
                if (!arg.name || !(arg.name instanceof String)) {
                    arg.name = `${arg.name}`;
                }
                if (!arg.description || !(arg.description instanceof String)) {
                    arg.description = `${arg.description}`;
                }
                if (!arg.type || !(arg.type instanceof String) || !addOptionFunctionName[arg.type]) {
                    arg.type = 'string';
                }
                this.args.push(arg);
            }
        })
        // sort args by whether they are required or not
        this.args.sort((a, b) => {
            const aRequired = (a instanceof Object && a.required);
            const bRequired = (b instanceof Object && b.required);
            if (aRequired && !bRequired) {
                return -1;
            } else if (!aRequired && bRequired) {
                return 1;
            }
            return 0;
        })

        if (this.isSlashCommand) {
            this.slashCommandBuilder = new SlashCommandBuilder()
                .setName(this.enforcedName)
                .setDescription(this.description)
                .setDMPermission(this.ephemeral);

            this.args.forEach((arg) => {

                // console.log(arg);
                // if arg is not an object (a string), just make it a string option
                // if (!(arg instanceof Object)) {
                //     this.slashCommandBuilder.addStringOption((option) => {
                //         option.setName(arg)
                //             .setDescription(arg)
                //         return option;
                //     })
                //     return;
                // }

                const type = (arg.type && addOptionFunctionName[arg.type] ? arg.type : undefined) || 'string';
                const functionName = addOptionFunctionName[type];
                this.slashCommandBuilder[functionName]((option) => {
                    option.setName(arg.name)
                    option.setDescription(arg.description || arg.name);
                    option.setRequired(arg.required !== undefined ? arg.required : false);

                    if (arg.autocomplete && false) {

                        option.setAutocomplete(true);

                        const choices = [];
                        if (arg.choices && arg.choices.length > 0) {
                            arg.choices.forEach((choice) => {
                                if (choice instanceof Object) {
                                    choices.push(`${choice.value}`);
                                } else {
                                    choices.push(`${choice}`);
                                }
                            })
                        }
                        

                    } else {

                        const choices = [];
                        if (arg.choices && arg.choices.length > 0) {
                            arg.choices.forEach((choice) => {
                                if (choice instanceof Object) {
                                    choices.push(choice);
                                } else {
                                    choices.push({ name: `${choice}`, value: choice });
                                }
                            })
                        }

                        if (arg.autocomplete) {
                            option.setAutocomplete(true);
                            this.autocompleteChoices[arg.name] = choices;
                        } else {
                            option.addChoices(...(choices.slice(0,25)));
                        }
                        

                    }

                    return option;
                })
            })
        }
    }

    async execute({message, interaction}) {
        if (this.isSlashCommand) {

        }

        if (this.executable) {
            await this.executable({message, interaction});
        } else {
            console.warn(`this command has no executable`);
        }
    }
}


const allowedOptionNameCharacters = 'abcdefghijklmnopqrstuvwxyz'

function enforceCharacters(string, characters = allowedOptionNameCharacters) {
    string = `${string}`.toLowerCase();
    let newString = '';
    for (let i = 0; i < string.length; i++) {
        const char = string.charAt(i);
        if (characters.includes(char)) {
            newString += char;
        }
    }
    return newString;
}

const addOptionFunctionName = {
    'int': 'addIntegerOption',
    'integer': 'addIntegerOption',
    'num': 'addNumberOption',
    'number': 'addNumberOption',
    'str': 'addStringOption',
    'string': 'addStringOption',
    'bool': 'addBooleanOption',
    'boolean': 'addBooleanOption',
    'user': 'addUserOption',
    'channel': 'addChannelOption',
    'role': 'addRoleOption',
    'mention': 'addMentionableOption',
    'mentionable': 'addMentionableOption',
    'attachment': 'addAttachmentOption',
    'subcommand': 'addSubcommand',
    'subcommandGroup': 'addSubcommandGroup'
}

module.exports = { Command }