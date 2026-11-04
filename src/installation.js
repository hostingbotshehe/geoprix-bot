// Content for the #moddable-download post. Edit the text here to change it.
const { EmbedBuilder } = require('discord.js');

const GEOPRIX_EMOJI = '<:geoprixmod:1567569991153360987>';
const GREEN = 0x18966f;
const AMBER = 0xf0a020;
const RED = 0xdb0d24;

// Shown in the guide. Update when you post a new build.
const BUILD = {
  file: 'GeoPrix_3.3_0.9.0a.xapk',
  game: '3.3',
  mod: '0.9.0a',
};

// Optional: set XAPK_URL (e.g. in Railway Variables) to a download link for the XAPK.
// Without it, the guide tells people to download the file posted in this channel.
function downloadLine() {
  const url = process.env.XAPK_URL;
  return url
    ? `**[⬇️ Download ${BUILD.file}](${url})**`
    : `Download **\`${BUILD.file}\`** from the file posted in this channel.`;
}

function buildInstallationEmbeds() {
  const guide = new EmbedBuilder()
    .setColor(GREEN)
    .setDescription(
      `## ${GEOPRIX_EMOJI} Installing GeoPrix Moddable\n` +
        `**Version:** GeoPrix ${BUILD.game} · Moddable ${BUILD.mod}\n` +
        '**Works on:** Android phones and tablets (not iPhone/iOS)\n\n' +
        downloadLine(),
    )
    .addFields(
      {
        name: '📦 What is an XAPK?',
        value:
          "GeoPrix comes as an **.xapk**: one file with several APK parts inside. Android can't open it on its own, " +
          'so you need an installer app such as **SAI** or **APKPure**.',
      },
      {
        name: '1️⃣ Back up and uninstall the original GeoPrix',
        value:
          'The modded version is signed differently, so it **cannot install over** the Play Store version. ' +
          'Make sure your progress is saved, then uninstall the original GeoPrix.',
      },
      {
        name: '2️⃣ Option A: SAI (recommended)',
        value:
          '1. Install **SAI (Split APKs Installer)** from the Google Play Store.\n' +
          '2. Open SAI and tap **Install APKs**.\n' +
          '3. Choose **File picker** and select the downloaded `.xapk` (usually in **Downloads**).\n' +
          '4. Make sure all parts are ticked, then tap **Install**.\n' +
          '5. If Android asks, allow SAI to **install unknown apps**, then go back and tap **Install** again.',
      },
      {
        name: '2️⃣ Option B: APKPure',
        value:
          '1. Install the **APKPure** app from its official website, apkpure.com.\n' +
          '2. Open your **Files** app, go to **Downloads** and tap the `.xapk`.\n' +
          '3. Choose **APKPure** to open it and tap **Install**.\n' +
          '4. If Android asks, allow APKPure to **install unknown apps**.',
      },
      {
        name: '3️⃣ Open GeoPrix',
        value:
          'Open GeoPrix from your home screen. If it opens, you\'re done! ' +
          'Mods (`.gpmod` files) go in the **GeoPrix Mods** folder.',
      },
      {
        name: '🛠️ Problems?',
        value:
          '• **"App not installed"**: uninstall every other GeoPrix version first, then try again.\n' +
          '• **"There was a problem parsing the package"**: the download is incomplete. Download it again.\n' +
          '• **Play Protect warning**: it shows up for any app not from the Play Store. Tap **More details → Install anyway** only if you got the file from this server.\n' +
          '• Still stuck? Ask in the help channel and include your phone model and the exact error.',
      },
    );

  const risks = new EmbedBuilder()
    .setColor(AMBER)
    .setDescription(
      '## ⚠️ Risks\n' +
        '• **Only download from this server.** Re-uploads elsewhere can contain malware or steal your account.\n' +
        "• **Back up your progress.** Uninstalling the original app can delete progress that isn't saved to the cloud.\n" +
        '• **No automatic updates.** The Play Store won\'t update the modded version. Check this channel for new builds.\n' +
        '• **Mods can be unstable.** Expect possible crashes or bugs, and report them instead of blaming the original game.\n' +
        '• **Your account is your responsibility.** Using a modified client may break the game\'s terms of service and could get your account restricted or banned.\n' +
        '• **Allowing "install unknown apps"** is a security setting. Turn it back off for SAI or APKPure after installing.',
    );

  const legal = new EmbedBuilder()
    .setColor(RED)
    .setDescription(
      '## ⚖️ Legal notice\n' +
        'GeoPrix Moddable is an **unofficial, fan-made modification**. It is **not affiliated with, endorsed by or ' +
        'supported by** the developers or publishers of GeoPrix. GeoPrix and all related names, logos and assets ' +
        'belong to their respective owners.\n\n' +
        'This software is provided **"as is", without any warranty**. You install and use it **at your own risk**. ' +
        'The GeoPrix Moddable team is not responsible for any damage, data loss, account action or other problems ' +
        'that result from using it.\n\n' +
        'Do **not** re-upload, sell or redistribute this build, and do **not** use it to bypass GeoPrix Pro or ads ' +
        '(see the rules). If you own rights to GeoPrix and have a concern, contact the server staff and we will respond promptly.',
    )
    .setFooter({ text: 'By downloading or installing, you accept these risks and this notice.' });

  return [guide, risks, legal];
}

module.exports = { buildInstallationEmbeds };
