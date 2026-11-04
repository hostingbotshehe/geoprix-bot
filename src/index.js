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
const path = require('node:path');
const { buildRulesEmbed } = require('./rules');
const { buildInstallationEmbeds } = require('./installation');

// Animated GIFs; regenerate with: python tools/make_banner.py
const asset = (name) => ({ attachment: path.join(__dirname, '..', 'assets', name), name });
const DIVIDER = 'rules-divider.gif';

// What /webhook-1 can post. Each post is: banner GIF, then its embeds, then the gradient divider.
const POSTS = {
  rules: {
    label: 'Rules',
    webhookName: 'GeoPrix Rules',
    banner: 'rules-banner.gif',
    embeds: () => [buildRulesEmbed()],
  },
  installation: {
    label: 'Installation',
    webhookName: 'GeoPrix Installation',
    banner: 'installation-banner.gif',
    embeds: () => buildInstallationEmbeds(),
  },
};

// Channels that get a specific post automatically. Anything else gets the rules.
const CHANNEL_POSTS = {
  [process.env.INSTALL_CHANNEL_ID || '1567573733063794948']: 'installation', // #moddable-download
};

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Check if the bot is alive'),
  new SlashCommandBuilder()
    .setName('webhook-1')
    .setDescription("Post this channel's info message (rules or installation) via a webhook")
    .addStringOption((o) =>
      o
        .setName('post')
        .setDescription("Post something other than this channel's default")
        .addChoices(...Object.entries(POSTS).map(([value, p]) => ({ name: p.label, value }))),
    )
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
      const key = interaction.options.getString('post') ?? CHANNEL_POSTS[interaction.channelId] ?? 'rules';
      await postContent(interaction, POSTS[key]);
      await interaction.editReply(`✅ ${POSTS[key].label} posted.`);
    } catch (err) {
      console.error('webhook-1 failed:', err);
      const msg =
        err.code === 50013
          ? "❌ I'm missing the **Manage Webhooks** permission in this channel. Give my role that permission and try again."
          : `❌ Couldn't post it: ${err.message}`;
      await interaction.editReply(msg);
    }
  }
});

async function postContent(interaction, post) {
  const channel = interaction.channel;
  if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) {
    throw new Error('use this in a normal text or announcement channel (not a thread, voice chat or forum).');
  }

  // Reuse our webhook if it already exists, so running the command again doesn't create duplicates.
  const hooks = await channel.fetchWebhooks();
  let hook = hooks.find((h) => h.owner?.id === client.user.id && h.name === post.webhookName);
  if (!hook) {
    hook = await channel.createWebhook({
      name: post.webhookName,
      avatar: client.user.displayAvatarURL(),
      reason: `/webhook-1 used by ${interaction.user.tag}`,
    });
  }

  // Banner, then the embeds, then the gradient divider, as separate messages so they stay in that order.
  await hook.send({ files: [asset(post.banner)] });
  await hook.send({ embeds: post.embeds(), allowedMentions: { parse: [] } });
  await hook.send({ files: [asset(DIVIDER)] });
}

registerCommands()
  .then(() => client.login(DISCORD_TOKEN))
  .catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
  });
