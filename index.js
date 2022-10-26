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

const { Client, Events, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
require('dotenv/config');
if (Global.testing) {
    Global.discordToken = process.env.DISCORD_TEST_TOKEN;
} else {
    Global.discordToken = process.env.DISCORD_TOKEN;
}

const { CommandLoader } = require('./commandLoader');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

// discord js collection, extended version of a map
client.commands = new Collection();

const rest = new REST({ version: '10' }).setToken(Global.discordToken);

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
    // console.log('message received');
})

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`no such command ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute({interaction});
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `error executing command ${interaction.commandName}`
            })
        }

    }
    
})

client.login(Global.discordToken);
