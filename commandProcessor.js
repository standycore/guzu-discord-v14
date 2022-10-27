

class CommandProcessor {
    constructor(options = {}) {
        this.prefix = options.prefix || 'gz';
    }

    static async checkForPrefix(message) {
        // check prefix
        const content = message.content;
        const prefix = 'gz';
        if (!content.startsWith(prefix)) {
            return; // { isCommand: false }
        }

        const split = content.split(' ');

        const result = {
            isCommand: true,
            commandName: split[1],
            args: split.slice(2),
        };

        return result;
    }

    static async processCommand(commandName, args, {isSlashCommand, interaction, message}) {
        // check if commandName exists
        const command = this.commands.get(commandName);

        if (!command) {
            console.error(`no such command ${commandName}`);
            return;
        }

        // check if the command is being called correctly
        if (command.isSlashCommand !== isSlashCommand) {
            return;
        }

        try {

            await command.execute({
                client: this.client,
                interaction,
                message, 
                args
            });

        } catch (error) {
            console.error(error);
            if (interaction) {
                await interaction.reply({
                    content: `error executing command ${commandName}`
                })
            } else if (message) {
                await message.reply({
                    content: `error executing command ${commandName}`
                })
            }
            
        }
    }
}

module.exports = { CommandProcessor };