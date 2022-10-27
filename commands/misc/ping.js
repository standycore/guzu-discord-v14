module.exports = {
    isSlashCommand: true,
    name: 'ping',
    description: 'get ponged',
    options: ['optiona', {
        name: 'optionb',
        description: 'this is the second option',
        type: 'string',
        choices: [
            'choiceA',
            { 
                name: 'choice b',
                value: 'valueB'
            }
        ],
    },
    {
        name: 'optionc',
        description: 'this is the third option',
        type: 'int',
        choices: [
            1979,
            { 
                name: 'choiceb',
                value: 200
            }
        ],
        autocomplete: true
    }
    ],
    executable: async ({interaction, message}) => {
        console.log('ping called!!')

        await interaction.reply('pong');
    }
}