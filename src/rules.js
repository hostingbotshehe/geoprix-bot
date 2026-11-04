// Content for /webhook-1. Edit the text here to change the posted rules.
const { EmbedBuilder } = require('discord.js');

// Server emoji :geoprixmod: (the green flag). Custom emojis don't render in embed titles
// or field names, so it's used in the description heading instead.
const GEOPRIX_EMOJI = '<:geoprixmod:1567569991153360987>';

const RULES = [
  {
    name: '🚫 1. No Pro or ad bypassing',
    value:
      'Do not bypass, crack or unlock **GeoPrix Pro**, and do not skip or block the **GeoPrix ad service**. ' +
      'Making, sharing, selling or asking for bypasses, cracked APKs or bypass tools is not allowed.\n' +
      '**Anyone caught making or distributing a bypass will be permanently banned.**',
  },
  {
    name: '🤝 2. Be respectful',
    value:
      'No harassment, bullying, hate speech, slurs, discrimination or threats. ' +
      'Disagreeing is fine, but keep it civil and take drama out of public channels.',
  },
  {
    name: '🔞 3. No NSFW',
    value:
      'No sexual, gory or disturbing content anywhere: messages, images, links, usernames, avatars or statuses.',
  },
  {
    name: '📢 4. No spam or self-promotion',
    value:
      'No message, emoji or caps spam, and no mass pinging. ' +
      'No advertising, server invites or unsolicited DM promotion without staff permission.',
  },
  {
    name: '🔒 5. Keep everyone safe',
    value:
      "Don't share anyone's personal information, including your own. " +
      'No scams, phishing links, malware or fake download links. Only download GeoPrix from official sources.',
  },
  {
    name: '💬 6. Use the right channels',
    value:
      'Keep conversations in the channel they belong in, and don\'t ping staff or developers without a good reason.',
  },
  {
    name: '🛡️ 7. Listen to staff',
    value:
      'Staff have the final say. If you disagree with a decision, message a staff member calmly instead of arguing in chat. ' +
      'Do not impersonate staff or developers.',
  },
  {
    name: '📜 8. Follow Discord ToS',
    value:
      'Follow the [Discord Terms of Service](https://discord.com/terms) and ' +
      '[Community Guidelines](https://discord.com/guidelines) at all times, including the minimum age requirement.',
  },
  {
    name: '⚖️ Punishments',
    value:
      'Depending on how serious it is: **warning → mute → kick → ban**. ' +
      'Staff can skip steps for serious cases, and rule 1 always means a permanent ban.',
  },
];

function buildRulesEmbed() {
  return new EmbedBuilder()
    .setDescription(
      `## ${GEOPRIX_EMOJI} GeoPrix Server Rules\n` +
        'Welcome to the GeoPrix community! Please read these rules before chatting. ' +
        "Staff may act on anything that breaks the spirit of these rules, even if it isn't listed here.",
    )
    .setColor(0x5865f2)
    .addFields(RULES)
    .setFooter({ text: 'By staying in this server, you agree to these rules. Rules may be updated at any time.' });
}

module.exports = { buildRulesEmbed };
