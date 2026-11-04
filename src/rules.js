// Content for /webhook-1. Edit the text here to change the posted rules.
const { EmbedBuilder } = require('discord.js');

const RULES = [
  {
    name: '1. No Pro or ad bypassing',
    value:
      'Do not bypass GeoPrix Pro or the GeoPrix ad service. ' +
      'Anyone caught **making or distributing** a bypass will be **permanently banned**.',
  },
  {
    name: '2. Keep it clean',
    value:
      'No NSFW content, no harassment, hate speech or spam, and no advertising. ' +
      'Be respectful to everyone.',
  },
  {
    name: '3. Follow Discord ToS',
    value:
      'Follow the [Discord Terms of Service](https://discord.com/terms) and ' +
      '[Community Guidelines](https://discord.com/guidelines) at all times.',
  },
];

function buildRulesEmbed() {
  return new EmbedBuilder()
    .setTitle('📜 GeoPrix Server Rules')
    .setDescription('Breaking these rules can get you muted, kicked or banned.')
    .setColor(0x5865f2)
    .addFields(RULES)
    .setFooter({ text: 'By staying in this server, you agree to these rules.' });
}

module.exports = { buildRulesEmbed };
