// Content for the #moddable-download post. Edit the text here to change it.
const { EmbedBuilder } = require('discord.js');

const GREEN = 0x18966f;
const AMBER = 0xf0a020;
const RED = 0xdb0d24;

// Update when you post a new build.
const BUILD = {
  file: 'GeoPrix_3.3_0.9.0a.xapk',
  game: '3.3',
  mod: '0.9.0a',
};

// Optional: set XAPK_URL (e.g. in Railway Variables) to a download link for the XAPK.
// Without it, the guide points to the file posted in this channel.
function downloadStep() {
  const url = process.env.XAPK_URL;
  return url
    ? `Download [${BUILD.file}](${url}).`
    : `Download \`${BUILD.file}\` from this channel.`;
}

function buildInstallationEmbeds() {
  const guide = new EmbedBuilder()
    .setColor(GREEN)
    .setTitle('Installation')
    .setDescription(
      `GeoPrix ${BUILD.game}, Moddable ${BUILD.mod}. Android only.\n\n` +
        `**1.** ${downloadStep()}\n` +
        '**2.** Uninstall the Play Store version of GeoPrix. Back up your progress first.\n' +
        '**3.** Install **SAI (Split APKs Installer)** from the Play Store.\n' +
        '**4.** In SAI, tap **Install APKs**, pick the `.xapk` and tap **Install**. ' +
        'Allow SAI to install unknown apps if asked.\n\n' +
        '**"App not installed":** another GeoPrix version is still installed. Remove it and try again.\n' +
        '**Parse error:** the download is incomplete. Download it again.',
    );

  const risks = new EmbedBuilder()
    .setColor(AMBER)
    .setTitle('Risks')
    .setDescription(
      '- Only download from this server. Re-uploads can contain malware.\n' +
        '- Uninstalling the original app can delete progress that isn\'t backed up.\n' +
        '- No automatic updates. New builds are posted here.\n' +
        '- Modified apps may break the game\'s terms of service.',
    );

  const legal = new EmbedBuilder()
    .setColor(RED)
    .setTitle('Legal notice')
    .setDescription(
      'GeoPrix Moddable is an unofficial fan modification, not affiliated with or endorsed by the developers of ' +
        'GeoPrix. All GeoPrix names and assets belong to their owners.\n\n' +
        'It may only be used for ethical mods, such as adding new features. Bypassing GeoPrix Pro, ads or other ' +
        'paid content, cheating, or harming other players is not allowed.\n\n' +
        'Provided as is, without warranty. You use it at your own risk; we are not responsible for data loss or ' +
        'damage. Do not re-upload or sell this build. Rights holders with concerns can contact staff.',
    );

  return [guide, risks, legal];
}

module.exports = { buildInstallationEmbeds };
