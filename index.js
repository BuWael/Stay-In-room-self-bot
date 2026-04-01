const { Client: BotClient, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, Events } = require('discord.js');
const { Client: SelfClient } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');

const BOT_TOKEN = "DISCORD_TOKEN".trim(); 

const bot = new BotClient({ intents: [GatewayIntentBits.Guilds] });

bot.on('ready', () => {
    console.log(`Manager Online: ${bot.user.tag}`);
    bot.application.commands.create({
        name: 'start',
        description: 'Start AfterLife Voice System',
    });
});

bot.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'start') {
        const modal = new ModalBuilder()
            .setCustomId('setup_modal')
            .setTitle('AfterLife Panel');

        const tokenInput = new TextInputBuilder()
            .setCustomId('user_token').setLabel("User Token").setStyle(TextInputStyle.Short).setRequired(true);

        const guildInput = new TextInputBuilder()
            .setCustomId('guild_id').setLabel("Server ID").setStyle(TextInputStyle.Short).setRequired(true);

        const voiceInput = new TextInputBuilder()
            .setCustomId('voice_id').setLabel("Voice ID").setStyle(TextInputStyle.Short).setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(tokenInput),
            new ActionRowBuilder().addComponents(guildInput),
            new ActionRowBuilder().addComponents(voiceInput)
        );

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'setup_modal') {
        const userToken = interaction.fields.getTextInputValue('user_token').trim();
        const guildId = interaction.fields.getTextInputValue('guild_id').trim();
        const voiceId = interaction.fields.getTextInputValue('voice_id').trim();

        await interaction.reply({ content: 'Connecting...', ephemeral: true });
        startSelfBot(userToken, guildId, voiceId, interaction);
    }
});

function startSelfBot(token, gId, vId, interaction) {
    const selfBot = new SelfClient({ checkUpdate: false });

    selfBot.on('ready', async () => {
        try {
            const guild = selfBot.guilds.cache.get(gId);
            const channel = guild?.channels.cache.get(vId);

            if (!guild || !channel) return interaction.editReply("Error: Invalid IDs.");


            selfBot.user.setActivity("By Bu WAEL", {
                type: "STREAMING",
                url: "https://www.twitch.tv/discord" 
            });

            const connect = () => {
                joinVoiceChannel({
                    channelId: vId,
                    guildId: gId,
                    adapterCreator: guild.voiceAdapterCreator,
                    selfDeaf: true,
                    selfMute: true
                });
            };

            connect();
            await interaction.editReply(`Done. ${channel.name}`);
            

            setInterval(() => {
                if (!guild.members.me.voice.channelId) {
                    connect();
                    console.log(`Re-connected to ${channel.name}`);
                }
            }, 15000);

        } catch (e) {
            interaction.editReply("Error.");
        }
    });

    selfBot.login(token).catch(() => interaction.editReply("Invalid Token."));
}

bot.login(BOT_TOKEN);


const http = require('http');
http.createServer((req, res) => {
    res.write("System Online");
    res.end();
}).listen(8080);
