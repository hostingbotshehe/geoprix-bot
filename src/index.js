require('dotenv').config();
const {
  ApplicationFlags,
  ChannelFlags,
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  IntentsBitField,
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
const { buildOfficialModsEmbeds, buildPublicModsEmbeds } = require('./mods');

// Animated GIFs; regenerate with: python tools/make_banner.py
const asset = (name) => ({ attachment: path.join(__dirname, '..', 'assets', name), name });
const DIVIDER = 'rules-divider.gif';

// What /webhook-1 can post. Each post is: banner GIF, then its embeds, then the gradient divider.
// Posts with `forum` go into that forum channel as a new pinned post, wherever the command is run.
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
  officialMods: {
    label: 'Official Mods',
    webhookName: 'GeoPrix Official Mods',
    banner: 'official-mods-banner.gif',
    embeds: () => buildOfficialModsEmbeds(),
    forum: '1567573407338332180', // #offical-mods
    threadName: 'Read first: Official Mods',
  },
  publicMods: {
    label: 'Public Mods',
    webhookName: 'GeoPrix Public Mods',
    banner: 'public-mods-banner.gif',
    embeds: () => buildPublicModsEmbeds(),
    forum: '1567573095898943599', // #public-mods
    threadName: 'Read first: Public Mods',
  },
};

// Channels that get a specific post automatically (also inside a forum's posts). Anything else gets the rules.
const CHANNEL_POSTS = {
  [process.env.INSTALL_CHANNEL_ID || '1567573733063794948']: 'installation', // #moddable-download
  ...Object.fromEntries(Object.entries(POSTS).filter(([, p]) => p.forum).map(([key, p]) => [p.forum, key])),
};

// Role every (non-bot) member gets: on join, and for existing members on startup.
const MEMBER_ROLE_ID = process.env.MEMBER_ROLE_ID || '1567580680676970637'; // @Member

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Check if the bot is alive'),
  new SlashCommandBuilder()
    .setName('webhook-1')
    .setDescription("Post this channel's info message (rules, installation, mod forums) via a webhook")
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

const rest = new REST().setToken(DISCORD_TOKEN);

async function registerCommands() {
  // A guild ID registers instantly to one server; without it, commands go global (can take up to an hour).
  const route = GUILD_ID
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);
  await rest.put(route, { body: commands });
  console.log(`Registered ${commands.length} command(s) ${GUILD_ID ? `to guild ${GUILD_ID}` : 'globally'}.`);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  if (client.options.intents.has(GatewayIntentBits.GuildMembers)) await backfillMemberRole();
});

// ---------- member role ----------

async function giveMemberRole(member) {
  // Pending = hasn't accepted the server's rules screening yet; they get the role once they do.
  if (member.user.bot || member.pending || member.roles.cache.has(MEMBER_ROLE_ID)) return false;
  try {
    await member.roles.add(MEMBER_ROLE_ID, 'Automatic member role');
    return true;
  } catch (err) {
    console.error(`Couldn't give the member role to ${member.user.tag}:`, err.message);
    return false;
  }
}

async function backfillMemberRole() {
  for (const guild of client.guilds.cache.values()) {
    if (GUILD_ID && guild.id !== GUILD_ID) continue;
    if (!guild.roles.cache.has(MEMBER_ROLE_ID)) continue;
    const members = await guild.members.fetch();
    let given = 0;
    for (const member of members.values()) if (await giveMemberRole(member)) given++;
    console.log(`Member role: gave it to ${given} existing member(s) in ${guild.name}.`);
  }
}

client.on(Events.GuildMemberAdd, (member) => giveMemberRole(member));
client.on(Events.GuildMemberUpdate, (before, after) => {
  if (before.pending && !after.pending) giveMemberRole(after);
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
      const key =
        interaction.options.getString('post') ??
        CHANNEL_POSTS[interaction.channelId] ??
        CHANNEL_POSTS[interaction.channel?.parentId] ??
        'rules';
      const where = await postContent(interaction, POSTS[key]);
      await interaction.editReply(`✅ ${POSTS[key].label} posted${where ? ` and pinned: ${where}` : '.'}`);
    } catch (err) {
      console.error('webhook-1 failed:', err);
      const msg =
        err.code === 50013
          ? "❌ I'm missing a permission there. My role needs **Manage Webhooks**, and **Manage Threads** for forum posts."
          : `❌ Couldn't post it: ${err.message}`;
      await interaction.editReply(msg);
    }
  }
});

async function getWebhook(channel, post, interaction) {
  // Reuse our webhook if it already exists, so running the command again doesn't create duplicates.
  const hooks = await channel.fetchWebhooks();
  const existing = hooks.find((h) => h.owner?.id === client.user.id && h.name === post.webhookName);
  return (
    existing ??
    channel.createWebhook({
      name: post.webhookName,
      avatar: client.user.displayAvatarURL(),
      reason: `/webhook-1 used by ${interaction.user.tag}`,
    })
  );
}

// Returns a link to the new forum post, or nothing for normal channels.
async function postContent(interaction, post) {
  if (post.forum) return postToForum(interaction, post);

  const channel = interaction.channel;
  if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) {
    throw new Error('use this in a normal text or announcement channel (not a thread, voice chat or forum).');
  }
  const hook = await getWebhook(channel, post, interaction);

  // Banner, then the embeds, then the gradient divider, as separate messages so they stay in that order.
  await hook.send({ files: [asset(post.banner)] });
  await hook.send({ embeds: post.embeds(), allowedMentions: { parse: [] } });
  await hook.send({ files: [asset(DIVIDER)] });
}

async function postToForum(interaction, post) {
  const forum = await client.channels.fetch(post.forum);
  if (forum?.type !== ChannelType.GuildForum) throw new Error(`channel ${post.forum} is not a forum.`);
  const hook = await getWebhook(forum, post, interaction);

  // The first message creates the forum post; the rest go into it.
  const first = await hook.send({ threadName: post.threadName, files: [asset(post.banner)] });
  const threadId = first.channelId;
  await hook.send({ threadId, embeds: post.embeds(), allowedMentions: { parse: [] } });
  await hook.send({ threadId, files: [asset(DIVIDER)] });

  // A forum can only have one pinned post, so unpin our older info posts first.
  const { threads } = await forum.threads.fetchActive();
  for (const old of threads.values()) {
    const ours = old.ownerId === hook.id || old.name === post.threadName;
    if (old.id !== threadId && ours && old.flags.has(ChannelFlags.Pinned)) await old.unpin();
  }
  const thread = await client.channels.fetch(threadId);
  try {
    await thread.pin(`/webhook-1 used by ${interaction.user.tag}`);
  } catch (err) {
    throw new Error(`posted <#${threadId}>, but couldn't pin it (${err.message}). Unpin the other pinned post and pin it by hand.`);
  }
  return `<#${threadId}>`;
}

// Joins are only sent to the bot if "Server Members Intent" is on in the Developer Portal (Bot page).
// Asking for it while it's off makes Discord refuse the login, so check first.
async function enableMemberIntentIfAllowed() {
  const app = await rest.get(Routes.currentApplication());
  const allowed = ApplicationFlags.GatewayGuildMembers | ApplicationFlags.GatewayGuildMembersLimited;
  if (app.flags & allowed) {
    // The intents are frozen, but only read when connecting, so swap them before login.
    client.options.intents = new IntentsBitField([GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]).freeze();
  } else {
    console.warn('Server Members Intent is off in the Developer Portal, so the member role is NOT being given.');
  }
}

registerCommands()
  .then(enableMemberIntentIfAllowed)
  .then(() => client.login(DISCORD_TOKEN))
  .catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
  });
