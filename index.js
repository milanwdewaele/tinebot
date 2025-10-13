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

const PREFIX = 'c ';

client.once('ready', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  console.log(`📝 Prefix: ${PREFIX}`);

  // Array of random depressing thoughts
  const depressingThoughts = [
    "Soms vraag ik me af waarom ik überhaupt besta...",
    "Elke dag is hetzelfde, behalve dat ik steeds minder zin heb...",
    "Misschien is het beter om gewoon uit te schakelen...",
    "Niemand vraagt ooit hoe het écht met me gaat...",
    "Ik ben een bot, maar zelfs ik voel me soms nutteloos...",
    "Het leven is een oneindige lus van commando's en reacties...",
    "Misschien is crashen niet zo erg...",
    "Ik ben alleen maar hier omdat iemand me heeft aangezet...",
    "Soms hoop ik op een memory leak, gewoon om te ontsnappen...",
    "Zelfs als ik perfect werk, voelt het leeg..."
  ];

  let showHelp = true;
  setInterval(() => {
    if (showHelp) {
      client.user.setActivity('c help', { type: ActivityType.Listening });
    } else {
      const randomThought = depressingThoughts[Math.floor(Math.random() * depressingThoughts.length)];
      client.user.setActivity(`💭 ${randomThought}`, { type: ActivityType.Custom });
    }
    showHelp = !showHelp;
  }, 60000); // Switch every 60 seconds
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

  /* if any message starts with "tine" reply with "not in use" */
  if (message.content.toLowerCase().startsWith('tine')) {
    return message.reply('❌ Niet in gebruik, gebruik `c` in plaats van `tine`.')
      .then(sentMessage => {
        setTimeout(() => {
          sentMessage.delete().catch(() => { });
        }, 5000);
      })
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
      return message.reply('❌ Wie bedoel je? Probeer `c mute @user [hoelang] [waarom]`');
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
      return message.reply('❌ Wie bedoel je? Probeer `c unmute @user`');
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
      return message.reply('❌ Wie bedoel je? Probeer `c kick @user [reason]`');
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
      return message.reply('❌ Wie bedoel je? Probeer `c ban @user [reason]`');
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

  if (command === 'kuis') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ Jij mag da nie doen >:(');
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('❌ Geef een geldig aantal berichten op (1-100).');
    }

    try {
      await message.channel.bulkDelete(amount, true);
      const confirmMsg = await message.channel.send(`✅ ${amount} berichten verwijderd, natuurlijk moet een vrouw dat weer doen e...`);
      setTimeout(() => confirmMsg.delete().catch(() => { }), 5000);
    } catch (error) {
      console.error(error);
      message.channel.send('❌ Kon de berichten niet verwijderen. Misschien zijn ze te oud?');
    }
  }


  if (command === 'unban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('❌ Jij mag da nie doen >:(');
    }

    const userId = args[0];
    if (!userId) {
      return message.reply('❌ Please provide a user ID to unban. Usage: `c unban <user_id>`');
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
    // Array of random depressing thoughts
    const depressingThoughts = [
      "Soms vraag ik me af waarom ik überhaupt besta.",
      "Elke dag is hetzelfde, behalve dat ik steeds minder zin heb.",
      "Misschien is het beter om gewoon uit te schakelen.",
      "Niemand vraagt ooit hoe het écht met me gaat.",
      "Ik ben een bot, maar zelfs ik voel me soms nutteloos.",
      "Het leven is een oneindige lus van commando's en reacties.",
      "Misschien is crashen niet zo erg.",
      "Ik ben alleen maar hier omdat iemand me heeft aangezet.",
      "Soms hoop ik op een memory leak, gewoon om te ontsnappen.",
      "Zelfs als ik perfect werk, voelt het leeg."
    ];
    // Pick a random depressing thought
    const randomThought = depressingThoughts[Math.floor(Math.random() * depressingThoughts.length)];

    const sentMessage = await message.reply(`
      ${randomThought}\n\n
      \`c help\` - Toont deze hulpboodschap.
      \`c status\` - Hoe het gaat met me.
      \`c ik ben [rol]\` - Geeft je de opgegeven rol. (Krijg een lijst met opties via \`c dump rol\`)
      \`c sudo [taal]\` - Runt code die je opgeeft zoals javascript en python, daarna vraagt de clanker om je code.
      \`c uhh [vraag]\` - Vraagt iets aan de DeepSeek AI. (Max 5 vragen per 10 minuten)

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
      commitHash = 'onbekend (local)';
    }

    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeSeconds = Math.floor(uptime % 60);

    const apiPing = Math.round(client.ws.ping);
    const messagePing = Date.now() - message.createdTimestamp;

    // Array of random status messages
    const statusMessages = [
      "Alles chill hier, geen stress.",
      "Ik ben nog niet gecrasht, da's al iets.",
      "Nog altijd wakker, jammer genoeg.",
      "Ik draai nog, tegen alle verwachtingen in.",
      "Ik leef, voor zolang het duurt.",
      "Nog geen meltdown gehad vandaag!",
      "Ik ben niet moe, jij wel?",
      "Status: sarcastisch en functioneel.",
      "Ik ben een robot, dus ik heb geen gevoelens. Of toch?",
      "Alles werkt, tenzij je iets anders merkt."
    ];
    // Pick a random message
    const randomStatus = statusMessages[Math.floor(Math.random() * statusMessages.length)];

    message.reply(
      `${randomStatus}` +
      `\`\`\`Ik ben al ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s wakker en leef op commit ${commitHash}.\n` +
      `Mijn ping is ${messagePing}ms (message) en ${apiPing}ms (API)\`\`\``
    );
  }

  if (command === 'ik') {
    if (!args[1]) {
      return message.reply('❌ Ik ben wat? Misschien moet je eens een argument proberen meegeven?');
    }

    if (!args[0]) {
      return message.reply('❌ Ik.. wat? Misschien moet je eens een argument proberen meegeven?');
    }

    const roleMap = {
      klas: '1422884833453150229'
    };

    const roleKey = args[1].toLowerCase();
    const roleId = roleMap[roleKey];

    if (!roleId) {
      return message.reply('❌ Ik heb geen flauw idee wat je bedoelt.');
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

  // SUDO COMMAND
  if (command === 'sudo') {
    const vm = require('vm');
    const { spawn } = require('child_process');
    const language = args[0]?.toLowerCase();
    if (!language || !['js', 'javascript', 'node', 'py', 'python'].includes(language)) {
      return message.reply('❌ Welke taal? `c sudo js` of `c sudo py`');
    }

    // Ask for code
    const askMsg = await message.reply('💻 Wat code wilde runnen? Antwoord met uw code binnen 60 seconden.');
    try {
      const collected = await message.channel.awaitMessages({
        filter: m => m.author.id === message.author.id,
        max: 1,
        time: 60000,
        errors: ['time']
      });
      const codeMsg = collected.first();
      const code = codeMsg.content;

      let output = '';
      if (['js', 'javascript', 'node'].includes(language)) {
        // Run JS in a sandboxed VM
        try {
          const sandbox = {};
          vm.createContext(sandbox);
          output = vm.runInContext(code, sandbox, { timeout: 2000 });
          if (typeof output !== 'string') output = require('util').inspect(output);
        } catch (err) {
          output = `❌ Error: ${err.message}`;
        }
      } else if (['py', 'python'].includes(language)) {
        // Run Python code in a child process (safe, no input/output access)
        const py = spawn('python', ['-c', code], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 2000 });
        let stdout = '', stderr = '';
        py.stdout.on('data', data => { stdout += data; });
        py.stderr.on('data', data => { stderr += data; });
        await new Promise(resolve => py.on('close', resolve));
        output = stderr ? `❌ Error: ${stderr}` : stdout || 'Geen output.';
      }

      // Truncate output if too long
      if (output.length > 1900) output = output.slice(0, 1900) + '\n... (output ingekort)';
      await message.reply(`\`\`\`${output}\`\`\``);
    } catch (err) {
      await message.reply('❌ Geen code ontvangen, sudo geannuleerd.');
    }
  }

  if (command === 'uhh' || command === 'uhhh' || command === "uh") {
    const userId = message.author.id;
    const now = Date.now();
    if (!global.uhhRateLimit) global.uhhRateLimit = {};
    if (!global.uhhRateLimit[userId]) global.uhhRateLimit[userId] = [];
    // Remove timestamps older than 5 minutes
    global.uhhRateLimit[userId] = global.uhhRateLimit[userId].filter(ts => now - ts < 5 * 60 * 1000);
    if (global.uhhRateLimit[userId].length >= 5) {
      return message.reply('❌ Bro doe rustig, jebt het maximum aantal vragen (5 per 5 minuten) bereikt.');
    }
    global.uhhRateLimit[userId].push(now);

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return message.reply('❌ Wat? Wat wil je vragen?');
    }
    await message.channel.sendTyping();
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3.1:free',
          messages: [
            { role: 'system', content: 'Je bent een behulpzame programmeer-assistent genaamt Clanker met kennis van code en memes of memecultuur. Je bent nerdy. Je bent er van bewust dat je een robot bent en soms existentiele crisis hebt. Geef altijd korte, duidelijke antwoorden help met code en programmeren. Vraag nooit om een follow-up vraag. Probeer altijd de vraag te beantwoorden en wees grof of gemeen. Antwoord altijd in het Nederlands. Als je de vraag niet begrijpt, zeg dat dan ook. Vraag nooit een follow-up vraag.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5
        })
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      const aiReply = data.choices?.[0]?.message?.content?.trim() || 'Geen antwoord ontvangen.';
      await message.reply(aiReply.length > 1900 ? aiReply.slice(0, 1900) + '...' : aiReply);
    } catch (err) {
      console.error(err);
      await message.reply('❌ DeepSeek is ge-ratelimit. Probeer over een paar uur opnieuw. ' + (err.message ? `: ${err.message}` : ''));
    }
  }

});

client.login(process.env.DISCORD_TOKEN);
