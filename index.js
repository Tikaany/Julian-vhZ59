const { Client, GatewayIntentBits, PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const token = process.env.TOKEN;
const clientId = '1260588659430654013';
const guildId = '1260686115443048489';

const rest = new REST({ version: '9' }).setToken(token);






// Registriere den Slash-Befehl
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: [
                {
                    name: 'bewerbung',
                    description: 'Erstellt einen neuen privaten Channel zur Bewerbung',
                }
            ] },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'bewerbung') {
        const user = interaction.user;

        // Erstelle den privaten Channel
        const channel = await interaction.guild.channels.create({
            name: `bewerbung-${user.username}`,
            type: ChannelType.GuildText, // 0 steht für Textkanal
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id, // Ersteller des Kanals
                    allow: [PermissionsBitField.Flags.ViewChannel],
                }
            ],
        });

        await interaction.reply({ content: `Dein Bewerbungs-Channel wurde erstellt: ${channel}`, ephemeral: true });

        // Sende eine Nachricht in den neuen Channel
        await channel.send(`Willkommen im Bewerbungs-Channel, ${user}! Bitte beantworte die folgenden Fragen.`);

        // Fragen stellen
        const questions = [
            "Wie lautet dein Name?",
            "Wie alt bist du?",
            "Was ist dein Beruf?",
            "Warum möchtest du dich bei uns bewerben?"
        ];

        const collectedAnswers = {};

        for (let i = 0; i < questions.length; i++) {
            await channel.send(questions[i]);
            const filter = m => m.author.id === user.id;
            const collected = await channel.awaitMessages({ filter, max: 1, time: 300000, errors: ['time'] })
                .catch(() => {
                    channel.send('Zeit abgelaufen. Bitte starte die Bewerbung erneut mit /bewerbung.');
                    setTimeout(() => {
                        channel.delete();
                    }, 10000);
                    return;
                });
            if (!collected) return;

            collectedAnswers[questions[i]] = collected.first().content;
        }

        await channel.send("Vielen Dank für deine Bewerbung! Hier sind deine Antworten:");
        for (const question in collectedAnswers) {
            await channel.send(`${question} ${collectedAnswers[question]}`);           
        }
        channelB= await interaction.guild.channels.fetch('1260695054780072090');

        const fields = Object.entries(collectedAnswers).map(([question, answer]) => {
            return { name: question, value: answer };
        });

        const embed = new EmbedBuilder()
        .setColor(0xff0005)
        .setTitle(`Bewerbung von ${user.username}`)
        .setDescription(`Diese wunderschöne Bewerbung von ${user.username} wird Ihnen präsentiert von Hofmann Pahres`)
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: `${user.username}`, iconURL: user.displayAvatarURL({ dynamic: true }) });

        const messageSent= await channelB.send({ embeds: [embed] }); 

        
        setTimeout(() => {
            channel.send("🚨3🚨");
        }, 17000);
        setTimeout(() => {
            channel.send("🚨2🚨");
        }, 18000); 
        setTimeout(() => {
            channel.send("🚨1🚨");
        }, 19000); // 20000 Millisekunden entsprechen 20 Sekunden
        await channel.send("🚨Dieser Kanal wird sich in 20 Sekunden automatisch löschen.🚨");
        setTimeout(() => {
            channel.delete();
        }, 20000); // 20000 Millisekunden entsprechen 20 Sekunden
    }
});

client.login(token);
