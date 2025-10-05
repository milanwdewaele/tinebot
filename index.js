require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField, ActivityType } = require('discord.js');
const fs = require('fs');

// Load trigger words from file
const triggerWords = JSON.parse(fs.readFileSync('./triggerWords.json', 'utf-8'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

const PREFIX = 'tine ';

client.once('ready', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  console.log(`📝 Prefix: ${PREFIX}`);

  client.user.setActivity('tine help', { type: ActivityType.Listening });
});


client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const messageContent = message.content.toLowerCase();
  const containsTriggerWord = triggerWords.some(word =>
    messageContent.includes(word.toLowerCase())
  );

  if (containsTriggerWord) {
    try {
      await message.react('🤨');
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }


  if (!message.content.toLowerCase().startsWith(PREFIX.toLowerCase())) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'mute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('❌ Jij mag da nie doen >:(');
    }

    const targetMember = message.mentions.members.first();
    if (!targetMember) {
      return message.reply('❌ Wie bedoel je? Probeer `tine mute @user [hoelang] [waarom]`');
    }

    if (!targetMember.moderatable) {
      return message.reply('❌ Godverdomme ik krijg die persoon nie stil.');
    }

    let duration = 10 * 60 * 1000;
    if (args[1] && !isNaN(args[1])) {
      duration = parseInt(args[1]) * 60 * 1000;
    }

    const reason = args.slice(args[1] && !isNaN(args[1]) ? 2 : 1).join(' ') || 'Omdat het kan';

    try {
      await targetMember.timeout(duration, reason);
      message.reply(`✅ ${targetMember.user.tag} ga zwijgen voor ${duration / 60000} minuten. Reden? ${reason}.`);
    } catch (error) {
      console.error(error);
      message.reply('❌ Ik kon die persoon niet doen fucking zwijgen.');
    }
  }

  if (command === 'unmute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('❌ Jij mag da nie doen >:(');
    }

    const targetMember = message.mentions.members.first();
    if (!targetMember) {
      return message.reply('❌ Wie bedoel je? Probeer `tine unmute @user`');
    }

    if (!targetMember.moderatable) {
      return message.reply('❌ Ik kan die persoon nie doen praten.');
    }

    try {
      await targetMember.timeout(null);
      message.reply(`✅ ${targetMember.user.tag} kan terug praten.`);
    } catch (error) {
      console.error(error);
      message.reply('❌ Er is iets misgegaan, oops :)');
    }
  }

  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('❌ Jij mag da nie doen >:(');
    }

    const targetMember = message.mentions.members.first();
    if (!targetMember) {
      return message.reply('❌ Wie bedoel je? Probeer `tine kick @user [reason]`');
    }

    if (!targetMember.kickable) {
      return message.reply('❌ Het is me niet gelukt, sorry.');
    }

    const reason = args.slice(1).join(' ') || 'Omdat het kan';

    try {
      await targetMember.kick(reason);
      message.reply(`✅ ${targetMember.user.tag} werd uit de klas gesmeten. Reden? ${reason}.`);
    } catch (error) {
      console.error(error);
      message.reply('❌ De persoon in kwestie was te zwaar om de klas uit te smijten.');
    }
  }

  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('❌ Jij mag da nie doen >:(');
    }

    const targetMember = message.mentions.members.first();
    if (!targetMember) {
      return message.reply('❌ Wie bedoel je? Probeer `tine ban @user [reason]`');
    }

    if (!targetMember.bannable) {
      return message.reply('❌ De persoon in kwestie is te zwaar om uit het raam te smijten.');
    }

    const reason = args.slice(1).join(' ') || 'Omdat het kan';

    try {
      await targetMember.ban({ reason });
      message.reply(`✅ ${targetMember.user.tag} werd uit het raam gesmeten. Waarom? ${reason}.`);
    } catch (error) {
      console.error(error);
      message.reply('❌ De persoon in kwestie is te zwaar om uit het raam te smijten.');
    }
  }


  if (command === 'unban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('❌ Jij mag da nie doen >:(');
    }

    const userId = args[0];
    if (!userId) {
      return message.reply('❌ Please provide a user ID to unban. Usage: `tine unban <user_id>`');
    }

    try {
      await message.guild.members.unban(userId);
      message.reply(`✅ User with ID ${userId} has been unbanned.`);
    } catch (error) {
      console.error(error);
      message.reply('❌ An error occurred while unbanning the user. Make sure the user ID is correct and the user is banned.');
    }
  }


  if (command === 'help') {
    const sentMessage = await message.reply(`
      Tot je dienst!
      \`tine help\` - Toont deze hulpboodschap.
      \`tine status\` - Hoe het gaat met me.
      \`tine ik ben [rol]\` - Geeft je de opgegeven rol. (Krijg een lijst met opties via \`tine dump rol\`)

      Suggesties? Laat het aan een daddy weten.
      `
    );

    setTimeout(() => {
      sentMessage.delete().catch(() => { });
    }, 30000
    );
  }

  if (command === 'dump') {
    if (!args[0]) {
      return message.reply('❌ Dump wa? Misschien moet je eens een argument proberen meegeven?');
    }
    const fileMap = {
      rol: './roles.txt'
    };
    const fileKey = args[0].toLowerCase();
    const filePath = fileMap[fileKey];
    if (!filePath) {
      return message.reply("❌ Da's geen geldig bestand om te dumpen dumbass.");
    }
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      message.reply(`Hier is de inhoud van __${args[0].toLowerCase()}__\n\`\`\`${fileContent}\`\`\``);
    } catch (error) {
      console.error(error);
      message.reply('❌ Er is iets misgegaan, oops :)');
    }
  }

  if (command === 'status') {
    const fs = require('fs');

    let commitHash;
    try {
      commitHash = fs.readFileSync('/opt/tinebot/commit.txt', 'utf8').trim();
    } catch (err) {
      commitHash = 'localdev';
    }

    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeSeconds = Math.floor(uptime % 60);

    const apiPing = Math.round(client.ws.ping);
    const messagePing = Date.now() - message.createdTimestamp;

    message.reply(
      `Alles is oké :)\n` +
      `\`\`\`Ik ben al ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s wakker en leef op commit ${commitHash}.\n` +
      `Mijn ping is ${messagePing}ms (message) en ${apiPing}ms (API)\`\`\``
    );
  }

  if (command === 'ik ben') {
    if (!args[0]) {
      return message.reply('❌ Je moet kiezen tussen `wvl` of `ovl`, of kies `expert` of `noob`. Probeer `tine ik ben wvl`.');
    }

    const roleMap = {
      wvl: '1423736341245595730',
      ovl: '1423736373936128111',
      expert: '1423737874477486080',
      noob: '1423737911542681753',
      klas: '1422884833453150229'
    };

    const roleKey = args[0].toLowerCase();
    const roleId = roleMap[roleKey];

    if (!roleId) {
      return message.reply('❌ Ik heb geen flauw idee waar da is. Kies `wvl` of `ovl`.');
    }

    const role = message.guild.roles.cache.get(roleId);
    if (!role) {
      return message.reply('❌ Fuck het lukt me nie, vraag een daddy.');
    }

    try {
      message.member.roles.add(role);
      message.reply(`✅ Leuk te weten da je van **${role.name}** bent.`);
    } catch (error) {
      console.error(error);
      message.reply('❌ Fuck het lukt me nie, heb ik genoeg rechten?');
    }
  }

});

client.login(process.env.DISCORD_TOKEN);
