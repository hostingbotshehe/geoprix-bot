# GeoPrix Bot

A simple Discord bot with `/ping` and a `/webhook-1` command that posts the server rules.

## Setup

1. Create an application at https://discord.com/developers/applications, add a **Bot**, and copy its token.
2. Invite it: OAuth2 → URL Generator → scopes `bot` + `applications.commands` → open the URL and pick your server.
3. Install and configure:

   ```bash
   npm install
   cp .env.example .env
   ```

   Fill in `DISCORD_TOKEN` and `CLIENT_ID` (Application ID). Set `GUILD_ID` to your server ID so `/ping` shows up instantly; leave it empty to register globally (up to an hour).

4. Run:

   ```bash
   npm start
   ```

## Commands

| Command | What it does |
|---------|--------------|
| `/ping` | Replies "Pong!" with round-trip and WebSocket latency |
| `/webhook-1` | Posts the server rules in the current channel through a "GeoPrix Rules" webhook. Only members with **Manage Server** can use it. The bot needs **Manage Webhooks** in that channel. |

To change the rules text, edit [src/rules.js](src/rules.js).
