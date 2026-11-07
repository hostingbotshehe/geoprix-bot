// Content for the #links post. Edit the links here to change it.
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const GREEN = 0x18966f;

const LINKS = {
  play: 'https://play.google.com/store/apps/details?id=com.jm.geoprix',
  developer: 'https://play.google.com/store/apps/developer?id=Agustio+Maitimu',
  website: 'https://geoprix-moddable.github.io/',
};

function buildLinksEmbeds() {
  return [
    new EmbedBuilder()
      .setColor(GREEN)
      .setTitle('Links')
      .setDescription(
        `**[GeoPrix on Google Play](${LINKS.play})**\n` +
          'The original game by Agustio Maitimu. ' +
          `More of their apps are on their [developer page](${LINKS.developer}).\n\n` +
          `**[GeoPrix Moddable website](${LINKS.website})**\n` +
          'Downloads, releases and mods for GeoPrix Moddable.',
      ),
  ];
}

// Link buttons under the embed.
function buildLinksButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Google Play').setURL(LINKS.play),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Website').setURL(LINKS.website),
    ),
  ];
}

module.exports = { buildLinksEmbeds, buildLinksButtons };
