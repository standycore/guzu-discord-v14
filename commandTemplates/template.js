// slash command
module.exports = {
    isSlashCommand: true,
    name: 'ping',
    description: 'get ponged',
    options: [], // or args: []
    executable: async ({interaction}) => {
        await interaction.reply('pong');
    }
}

// normal command
module.exports = {
    isSlashCommand: false,
    name: 'ping',
    description: 'get ponged',
    options: [],
    executable: async ({message}) => {
        await message.reply('pong');
    }
}

const exampleOptions = {
    guilds: ['guildid'], // ignore guilds if you want it to work anywhere
    // ensure that the bot is in the guild with the guildid

    // ephemeral: false, // if true, if slash, only shows response to commander, if not slash, sends response to dm

    // options array of options (arguments). it can be a simple string, or an object with name, desc, and type.
    // object with name, desc, and type only has real benefits for slash commands
    // options should be sorted with required options first
    options: ['optiona', { // NOTE - option names must be all lowercase, a-z only with no special characters or spaces
        name: 'optionb', 
        description: 'desc for optionB',
        type: 'string', // default is string

        // possible types are: https://discordjs.guide/slash-commands/advanced-creation.html#option-types
        // string, integer, number, 
        // ^ these can also have a choices option, default is undefined or empty.
        // if choices is defined, they are enforced. if autocomplete is true, this will behave differently. see below
        choices: [
            'stringOnlyValue', // if just a value, the name will also be the value stringified
            {
                name: 'choice name!',
                value: 'choiceValue'
            }
        ], // max choices: 25
        // more types: 
        // boolean
        // user, channel, role, mentionable
        // attachment
        // subcommand, subcommandGroup
        required: false, // default true, makes the option required
        autocomplete: false, // default false. if true, choices are all read by value
        // https://discordjs.guide/slash-commands/autocomplete.html#handling-multiple-autocomplete-options
        // only these types are available to be autocomplete normally:
        // const string = interaction.options.getString('input');
        // const integer = interaction.options.getInteger('int');
        // const boolean = interaction.options.getBoolean('choice');
        // const number = interaction.options.getNumber('num');
        // for others, use:
        // interaction.options.get('option').value
        
    }],
    // permissions (for slash commands)
    DMPermission: false, // allow in dms, default false
    ephemeral: false, // alias for DMPermission
}