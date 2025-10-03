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
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Check for trigger words and react with raised eyebrow emoji
  const messageContent = message.content.toLowerCase();
  const containsTriggerWord = triggerWords.some(word => 
    messageContent.includes(word.toLowerCase())
  );
  
  if (containsTriggerWord) {
    setTimeout(async () => {
      try {
        await message.react('🤨');
      } catch (error) {
        console.error('Failed to add reaction:', error);
      }
    }, 2000); // 2 second delay
  }
  
  // Check if message starts with prefix
  if (!message.content.toLowerCase().startsWith(PREFIX.toLowerCase())) return;
  
  // Parse command and arguments
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  // Command: mute
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
    
    // Parse duration (default: 10 minutes)
    let duration = 10 * 60 * 1000; // 10 minutes in ms
    if (args[1] && !isNaN(args[1])) {
      duration = parseInt(args[1]) * 60 * 1000; // Convert minutes to ms
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
  
  // Command: unmute
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
  
  // Command: kick
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
  
  // Command: ban
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
  
  // Command: unban
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
  
  // Command: help
  if (command === 'help') {
    message.reply("Zoek het zelf uit. :P");
  }
});

client.login(process.env.DISCORD_TOKEN);
