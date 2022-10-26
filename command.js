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
        this.description = options.description || 'no description';
        // can be called in dm
        this.ephemeral = (options.DMPermission !== undefined ? options.DMPermission : undefined) || 
        (options.ephemeral !== undefined ? options.ephemeral : undefined) || false;

        this.args = options.options || options.args || [];
        // sort options by whether they are required or not
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
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(this.ephemeral);
            const args = this.args;
            if (args && args.length > 0) {
                args.forEach((arg) => {

                    // if arg is not an object (a string), just make it a string option
                    if (!(arg instanceof Object)) {
                        this.slashCommandBuilder.addStringOption((option) => {
                            option.setName(arg)
                                .setDescription(arg)
                            return option;
                        })
                        return;
                    }

                    const type = (arg.type && addOptionFunctionName[arg.type] ? arg.type : undefined) || 'string';
                    const functionName = addOptionFunctionName[type];
                    this.slashCommandBuilder[functionName]((option) => {
                        option.setName(arg.name)
                        option.setDescription(arg.description || arg.name);
                        option.setRequired(arg.required !== undefined ? arg.required : false);

                        if (arg.autocomplete) {

                            option.setAutocomplete(true);

                        } else {

                            const choices = [];
                            if (arg.choices && arg.choices.length > 0) {
                                arg.choices.forEach((choice, i) => {
                                    if (i > 24) {
                                        return;
                                    }
                                    if (choice instanceof Object) {
                                        choices.push(choice);
                                    } else {
                                        choices.push({ name: `${choice}`, value: choice })
                                    }
                                })
                            }
                            option.addChoices(...choices);

                        }

                        return option;
                    })
                })
            }
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