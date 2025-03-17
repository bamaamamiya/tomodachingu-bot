require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const { translate } = require("@vitalets/google-translate-api");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// ==== Slash Commands Registration ====
const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help menu'),
  new SlashCommandBuilder()
    .setName('info')
    .setDescription('Show server information'),
  new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text')
    .addStringOption(option =>
      option.setName('source_lang')
        .setDescription('Source language (e.g., en, ja)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('target_lang')
        .setDescription('Target language (e.g., ja, en)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to translate')
        .setRequired(true))
].map(command => command.toJSON());

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('Slash commands registered!');
  } catch (err) {
    console.error('Error registering slash commands:', err);
  }
});

// ==== Message-based Commands ====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const content = message.content.toLowerCase().trim();
  const member = message.member;
  const displayName = member
    ? member.displayName || message.author.username
    : message.author.username;

  const greetingsEnglish = ["hello", "hi", "hey", "yo"];
  const greetingsIndo = ["halo"];
  const greetingsJapan = ["konnichiwa", "こんにちは"];
  const greetingsKorean = ["annyeong", "안녕"];

  if (greetingsEnglish.some((greet) => content.includes(greet))) {
    message.reply(`Hello back, ${displayName}! 👋`);
  } else if (greetingsIndo.some((greet) => content.includes(greet))) {
    message.reply(`Halo juga, ${displayName}! 🙌`);
  } else if (greetingsJapan.some((greet) => content.includes(greet))) {
    message.reply(`Konnichiwa, ${displayName}! 🏯`);
  } else if (greetingsKorean.some((greet) => content.includes(greet))) {
    message.reply(`Annyeong, ${displayName}! 🇰🇷`);
  }

  // Manual commands
  if (content === "!help") {
    message.reply(`Hi ${displayName}! I'm **Tomodachingu Bot**, here to assist you! 🌏
Commands:
- !help / /help: Show this help menu
- !info / /info: Information about Tomodachingu server
- !translate <source_lang> <target_lang> <text>`);
  } else if (content === "!info") {
    message.reply(`🌍 **Tomodachingu Server Info** 🌍
Tomodachingu is an international community where everyone can connect, learn, and share across cultures.

✨ We focus on language exchange, cultural learning, and creating a space where people from all backgrounds can share knowledge and experiences.

📌 Main Languages: English, 日本語, 한국어, Bahasa Indonesia
📌 Features: Language exchange, cultural discussions, learning resources, and friendly community vibes!

🕒 **Active Hours:**
- Indonesia (WIB): 6 PM - 12 AM
- Japan (JST): 8 PM - 2 AM
- Korea (KST): 8 PM - 2 AM
- USA (EST): 6 AM - 12 PM
- UK (GMT): 11 AM - 5 PM

Feel free to join anytime, but these are the peak hours when most members are active!

Welcome aboard, ${displayName}! 🎉`);
  } else if (content.startsWith("!translate")) {
    const args = message.content.split(" ");
    if (args.length < 4) {
      message.reply(`Usage: !translate <source_lang> <target_lang> <text>\nExample: !translate en ja Hello!`);
      return;
    }

    const sourceLang = args[1];
    const targetLang = args[2];
    const text = args.slice(3).join(" ");

    try {
      const res = await translate(text, { from: sourceLang, to: targetLang });
      message.reply(`Translated (${sourceLang} → ${targetLang}): ${res.text}\n\nSorry if the translation isn't perfect! 🙏`);
    } catch (error) {
      console.error("Translation error:", error);
      message.reply("Sorry, there was an error translating your text. Please check your input and try again.");
    }
  }
});

// ==== Slash Command Handling ====
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;
  const displayName = interaction.member?.displayName || interaction.user.username;

  if (commandName === 'help') {
    await interaction.reply(`Hi ${displayName}! I'm **Tomodachingu Bot**, here to assist you! 🌏
Commands:
/help - Show this help menu
/info - Information about Tomodachingu server
/translate <source_lang> <target_lang> <text>`);
  }

  if (commandName === 'info') {
    await interaction.reply(`🌍 **Tomodachingu Server Info** 🌍
Tomodachingu is an international community where everyone can connect, learn, and share across cultures.

✨ Focused on language exchange, cultural learning, and creating a space where people can share knowledge and experiences.

📌 Main Languages: English, 日本語, 한국어, Bahasa Indonesia
🕒 Active Hours:
- Indonesia (WIB): 6 PM - 12 AM
- Japan (JST): 8 PM - 2 AM
- Korea (KST): 8 PM - 2 AM
- USA (EST): 6 AM - 12 PM
- UK (GMT): 11 AM - 5 PM

Welcome aboard, ${displayName}! 🎉`);
  }

  if (commandName === 'translate') {
    const sourceLang = interaction.options.getString('source_lang');
    const targetLang = interaction.options.getString('target_lang');
    const text = interaction.options.getString('text');

    try {
      const res = await translate(text, { from: sourceLang, to: targetLang });
      await interaction.reply(`Translated (${sourceLang} → ${targetLang}): ${res.text}\n\nSorry if the translation isn't perfect! 🙏`);
    } catch (error) {
      console.error("Translation error:", error);
      await interaction.reply("Sorry, there was an error translating your text. Please check your input and try again.");
    }
  }
});

// ==== Welcome Message ====
client.on("guildMemberAdd", (member) => {
  const displayName = member.displayName || member.user.username;
  const welcomeMessages = [
    `Hello ${displayName}! Welcome to **Tomodachingu**! 🎉`,
    `Halo ${displayName}, selamat datang di **Tomodachingu**! 🙌`,
    `こんにちは ${displayName} さん、**Tomodachingu** へようこそ! 🏯`,
    `안녕하세요 ${displayName}님! **Tomodachingu**에 오신 것을 환영합니다! 🇰🇷`,
  ];
  const message =
    welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  const channel = member.guild.systemChannel;
  if (channel) channel.send(message);
});

client.login(process.env.DISCORD_TOKEN);
