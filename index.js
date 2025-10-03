require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

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
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Check if message starts with prefix
  if (!message.content.toLowerCase().startsWith(PREFIX.toLowerCase())) return;
  
  // Parse command and arguments
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  // Command: mute
  if (command === 'mute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('❌ You do not have permission to mute members.');
    }
    
    const targetMember = message.mentions.members.first();
    if (!targetMember) {
      return message.reply('❌ Please mention a user to mute. Usage: `tine mute @user [duration] [reason]`');
    }
    
    if (!targetMember.moderatable) {
      return message.reply('❌ I cannot mute this user.');
    }
    
    // Parse duration (default: 10 minutes)
    let duration = 10 * 60 * 1000; // 10 minutes in ms
    if (args[1] && !isNaN(args[1])) {
      duration = parseInt(args[1]) * 60 * 1000; // Convert minutes to ms
    }
    
    const reason = args.slice(args[1] && !isNaN(args[1]) ? 2 : 1).join(' ') || 'No reason provided';
    
    try {
      await targetMember.timeout(duration, reason);
      message.reply(`✅ ${targetMember.user.tag} has been muted for ${duration / 60000} minutes. Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('❌ An error occurred while muting the user.');
    }
  }
  
  // Command: unmute
  if (command === 'unmute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('❌ You do not have permission to unmute members.');
    }
    
    const targetMember = message.mentions.members.first();
    if (!targetMember) {
      return message.reply('❌ Please mention a user to unmute. Usage: `tine unmute @user`');
    }
    
    if (!targetMember.moderatable) {
      return message.reply('❌ I cannot unmute this user.');
    }
    
    try {
      await targetMember.timeout(null);
      message.reply(`✅ ${targetMember.user.tag} has been unmuted.`);
    } catch (error) {
      console.error(error);
      message.reply('❌ An error occurred while unmuting the user.');
    }
  }
  
  // Command: kick
  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('❌ You do not have permission to kick members.');
    }
    
    const targetMember = message.mentions.members.first();
    if (!targetMember) {
      return message.reply('❌ Please mention a user to kick. Usage: `tine kick @user [reason]`');
    }
    
    if (!targetMember.kickable) {
      return message.reply('❌ I cannot kick this user.');
    }
    
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    try {
      await targetMember.kick(reason);
      message.reply(`✅ ${targetMember.user.tag} has been kicked. Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('❌ An error occurred while kicking the user.');
    }
  }
  
  // Command: ban
  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('❌ You do not have permission to ban members.');
    }
    
    const targetMember = message.mentions.members.first();
    if (!targetMember) {
      return message.reply('❌ Please mention a user to ban. Usage: `tine ban @user [reason]`');
    }
    
    if (!targetMember.bannable) {
      return message.reply('❌ I cannot ban this user.');
    }
    
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    try {
      await targetMember.ban({ reason });
      message.reply(`✅ ${targetMember.user.tag} has been banned. Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('❌ An error occurred while banning the user.');
    }
  }
  
  // Command: unban
  if (command === 'unban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('❌ You do not have permission to unban members.');
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
    const helpMessage = `
**📋 TineBot Commands**

**Moderation Commands:**
• \`tine mute @user [duration_minutes] [reason]\` - Mute a user (default: 10 minutes)
• \`tine unmute @user\` - Unmute a user
• \`tine kick @user [reason]\` - Kick a user from the server
• \`tine ban @user [reason]\` - Ban a user from the server
• \`tine unban <user_id>\` - Unban a user by their ID
• \`tine help\` - Show this help message

**Examples:**
\`tine mute @User 30 Spamming\` - Mute user for 30 minutes
\`tine kick @User Breaking rules\` - Kick user with reason
\`tine ban @User\` - Ban user
    `;
    message.reply(helpMessage);
  }
});

client.login(process.env.DISCORD_TOKEN);
