const { Global } = require('./global');

const processArgs = process.argv.slice(2);
for (let i = 0; i < processArgs.length; i++) {
    const arg = processArgs[i];
    switch (arg) {
        case 'test':
            Global.testing = true;
            break;
        default:
            break;
    }
}

// discord.js v14

const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv/config');
if (Global.testing) {
    Global.discordToken = process.env.DISCORD_TEST_TOKEN;
    Global.clientId = process.env.DISCORD_TEST_CLIENT_ID;
} else {
    Global.discordToken = process.env.DISCORD_TOKEN;
    Global.clientId = process.env.DISCORD_CLIENT_ID;
}

const { CommandLoader } = require('./commandLoader');
const { CommandProcessor } = require('./commandProcessor');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

// discord js collection, extended version of a map
const commands = new Collection();
client.commands = commands;
CommandProcessor.commands = commands;
CommandProcessor.client = client;

client.on(Events.ClientReady, async () => {
    if (Global.testing) {
        console.log('guzu test bot client ready');
    } else {
        console.log('guzu bot client ready');
    }

    const commandPaths = await CommandLoader.getLocalCommands('./commands');
    await CommandLoader.loadCommands(commandPaths, client.commands);

    console.log('all commands ready');
})

client.on(Events.MessageCreate, async (message) => {

    const result = await CommandProcessor.checkForPrefix(message);

    if (!result || !result.isCommand) {
        return;
    }

    CommandProcessor.processCommand(result.commandName, result.args, { isSlashCommand: false, message });
    
})

client.on(Events.InteractionCreate, async (interaction) => {

    if (interaction.isChatInputCommand()) {
        
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`no such command ${interaction.commandName}`);
            return;
        }

        CommandProcessor.processCommand(interaction.commandName, interaction.options, { isSlashCommand: true, interaction })

    } else if (interaction.isAutocomplete()) {
        // not sure if this is only when there is an autocomplete option (command is already set)
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`no such command ${interaction.commandName}`);
            return;
        }

        const focusedValue = interaction.options.getFocused();
        const focusedOption = interaction.options.getFocused(true);
        const choices = command.autocompleteChoices[focusedOption.name] ? command.autocompleteChoices[focusedOption.name] : [];
        const filtered = choices.filter((choice) => {
            return choice.name.startsWith(focusedValue);
        });
        await interaction.respond(
            filtered.map((choice) => { return { name: choice.name, value: `${choice.value}` } })
        )
    }
})

client.login(Global.discordToken);
