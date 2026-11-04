// Content for the pinned info posts in the two mod forums. Edit the text here to change them.
const { EmbedBuilder } = require('discord.js');

const GREEN = 0x18966f;
const AMBER = 0xf0a020;
const RED = 0xdb0d24;

// The versions mods currently have to support. Update with each new build.
const SUPPORTED = { game: '3.3', mod: '0.9.0a' };

const INSTALL_STEPS =
  '**1.** Download the `.gpmod` file from the post.\n' +
  '**2.** In your Files app, copy it into the **GeoPrix Mods** folder.\n' +
  '**3.** Restart GeoPrix.';

function compatibilityEmbed() {
  return new EmbedBuilder()
    .setColor(RED)
    .setTitle('Compatibility')
    .setDescription(
      `Current version: **GeoPrix ${SUPPORTED.game}, Moddable ${SUPPORTED.mod}**.\n\n` +
        'A mod only works with the GeoPrix and Moddable version it was made for. Older `.gpmod` files will not ' +
        'work with newer versions of the mod loader, and newer mods will not work with older ones. ' +
        'Check the version listed in a post before installing.',
    );
}

function buildOfficialModsEmbeds() {
  const about = new EmbedBuilder()
    .setColor(GREEN)
    .setTitle('Official Mods')
    .setDescription(
      'Mods in this forum are posted by approved modders only. This is the trusted place to get mods.\n\n' +
        INSTALL_STEPS,
    );

  const posting = new EmbedBuilder()
    .setColor(AMBER)
    .setTitle('Posting (modders)')
    .setDescription(
      'Every post needs the mod name, what it does, the supported GeoPrix and Moddable version, and the ' +
        '`.gpmod` file. Mods must follow the legal notice: ethical mods only, no Pro or ad bypasses.',
    );

  return [about, compatibilityEmbed(), posting];
}

function buildPublicModsEmbeds() {
  const about = new EmbedBuilder()
    .setColor(AMBER)
    .setTitle('Public Mods')
    .setDescription(
      'Anyone can upload mods here. This forum is only partially moderated and mods are not reviewed by staff, ' +
        'so installing them is **not recommended**. Use Official Mods when you can.\n\n' +
        'A mod runs code inside GeoPrix. A bad one can crash the game, wipe your progress or get your account ' +
        'banned. Only install mods from people you trust, and report harmful ones to staff.\n\n' +
        INSTALL_STEPS,
    );

  const posting = new EmbedBuilder()
    .setColor(GREEN)
    .setTitle('Posting')
    .setDescription(
      'Include the mod name, what it does, the supported GeoPrix and Moddable version, and the `.gpmod` file. ' +
        'Ethical mods only. Mods that bypass Pro or ads, cheat or harm players are removed and the uploader is banned.',
    );

  return [about, compatibilityEmbed(), posting];
}

module.exports = { buildOfficialModsEmbeds, buildPublicModsEmbeds };
