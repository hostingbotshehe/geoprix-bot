require('dotenv').config();
const {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require('discord.js');
const { buildRulesEmbed } = require('./rules');

const path = require('node:path');

const WEBHOOK_NAME = 'GeoPrix Rules';
// Regenerate with: python tools/make_banner.py
const RULES_BANNER = path.join(__dirname, '..', 'assets', 'rules-banner.png');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Check if the bot is alive'),
  new SlashCommandBuilder()
    .setName('webhook-1')
    .setDescription('Post the server rules in this channel via a webhook')
    // Only members with Manage Server see/use it by default (adjustable in Server Settings -> Integrations).
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild),
].map((c) => c.toJSON());

async function registerCommands() {
  const rest = new REST().setToken(DISCORD_TOKEN);
  // A guild ID registers instantly to one server; without it, commands go global (can take up to an hour).
  const route = GUILD_ID
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);
  await rest.put(route, { body: commands });
  console.log(`Registered ${commands.length} command(s) ${GUILD_ID ? `to guild ${GUILD_ID}` : 'globally'}.`);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    const sent = Date.now();
    await interaction.reply('Pong!');
    const roundTrip = Date.now() - sent;
    await interaction.editReply(`Pong! 🏓 Round trip: ${roundTrip}ms · WebSocket: ${client.ws.ping}ms`);
  }

  if (interaction.commandName === 'webhook-1') {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      await postRules(interaction);
      await interaction.editReply('✅ Rules posted.');
    } catch (err) {
      console.error('webhook-1 failed:', err);
      const msg =
        err.code === 50013
          ? "❌ I'm missing the **Manage Webhooks** permission in this channel. Give my role that permission and try again."
          : `❌ Couldn't post the rules: ${err.message}`;
      await interaction.editReply(msg);
    }
  }
});

async function postRules(interaction) {
  const channel = interaction.channel;
  if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) {
    throw new Error('use this in a normal text or announcement channel (not a thread, voice chat or forum).');
  }

  // Reuse our webhook if it already exists, so running the command again doesn't create duplicates.
  const hooks = await channel.fetchWebhooks();
  let hook = hooks.find((h) => h.owner?.id === client.user.id && h.name === WEBHOOK_NAME);
  if (!hook) {
    hook = await channel.createWebhook({
      name: WEBHOOK_NAME,
      avatar: client.user.displayAvatarURL(),
      reason: `/webhook-1 used by ${interaction.user.tag}`,
    });
  }

  // Banner first, then the rules, as two messages so the banner always sits on top.
  await hook.send({ files: [{ attachment: RULES_BANNER, name: 'rules-banner.png' }] });
  await hook.send({ embeds: [buildRulesEmbed()], allowedMentions: { parse: [] } });
}

registerCommands()
  .then(() => client.login(DISCORD_TOKEN))
  .catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
  });
