# GeoPrix Bot

A simple Discord bot with `/ping` and a `/webhook-1` command that posts the server rules or the installation guide.

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
| `/webhook-1` | Posts this channel's info message through a webhook: the **installation guide** in #moddable-download, the **rules** everywhere else. Pick `post:` to override. Only members with **Manage Server** can use it. The bot needs **Manage Webhooks** in that channel. |

Each post is three messages: an animated banner ([rules](assets/rules-banner.gif) / [installation](assets/installation-banner.gif)), the embeds, then the gradient strip [assets/rules-divider.gif](assets/rules-divider.gif).

The XAPK is too big to post through the bot (46 MB vs Discord's 10 MB webhook limit on unboosted servers), so the guide either links to `XAPK_URL` or tells people to download the file posted in the channel. XAPKs are git-ignored.

To change the text, edit [src/rules.js](src/rules.js) or [src/installation.js](src/installation.js) (also update `BUILD` there for a new version). To change the banner, edit [tools/make_banner.py](tools/make_banner.py) and run `python tools/make_banner.py` (needs Pillow and `Hokjesgeest.otf` in the project folder; the font isn't committed).
