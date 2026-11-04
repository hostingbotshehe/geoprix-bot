require('dotenv').config();
const { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Check if the bot is alive'),
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
});

registerCommands()
  .then(() => client.login(DISCORD_TOKEN))
  .catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
  });
