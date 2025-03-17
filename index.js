require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { translate } = require("@vitalets/google-translate-api");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase().trim();
  const member = message.member;
  const displayName = member
    ? member.displayName || message.author.username
    : message.author.username;

  // === Log Message Content ===
  console.log(`Received message content: "${message.content}"`);
  console.log(`Normalized content: "${content}"`);

  const greetingsEnglish = ["hello", "hi", "hey", "yo"];
  const greetingsIndo = ["halo"];
  const greetingsJapan = ["konnichiwa", "こんにちは"];
  const greetingsKorean = ["annyeong", "안녕"];
  // === Greetings ===
  if (greetingsEnglish.some(greet => content.includes(greet))) {
		message.reply(`Hello back, ${displayName}! 👋`);
	} else if (greetingsIndo.some(greet => content.includes(greet))) {
		message.reply(`Halo juga, ${displayName}! 🙌`);
	} else if (greetingsJapan.some(greet => content.includes(greet))) {
		message.reply(`Konnichiwa, ${displayName}! 🏯`);
	} else if (greetingsKorean.some(greet => content.includes(greet))) {
		message.reply(`Annyeong, ${displayName}! 🇰🇷`);
	}

  // === Help & Info Commands ===
  if (content === "!help") {
    message.reply(
      `Hi ${displayName}! I'm **Tomodachingu Bot**, here to assist you! 🌏\nCommands:\n- !help: Show this help menu\n- !info: Information about Tomodachingu server\n- !translate <source_lang> <target_lang> <text>`
    );
  } else if (content === "!info") {
    message.reply(
      `🌍 **Tomodachingu Server Info** 🌍
Tomodachingu is an international community where everyone can connect, learn, and share across cultures.

✨ We focus on language exchange, cultural learning, and creating a space where people from all backgrounds can share knowledge and experiences.

📌 Main Languages: English, 日本語, 한국어, Bahasa Indonesia
📌 Features: Language exchange, cultural discussions, learning resources, and friendly community vibes!

Welcome aboard, ${displayName}! 🎉`
    );
  } else if (content.startsWith("!translate")) {
    const args = message.content.split(" ");

    if (args.length < 4) {
      message.reply(
        `Usage: !translate <source_lang> <target_lang> <text>\nExample: !translate en ja Hello!`
      );
      return;
    }

    const sourceLang = args[1];
    const targetLang = args[2];
    const text = args.slice(3).join(" ");

    try {
      const res = await translate(text, { from: sourceLang, to: targetLang });
      message.reply(`Translated (${sourceLang} → ${targetLang}): ${res.text}`);
    } catch (error) {
      console.error("Translation error:", error);
      message.reply(
        "Sorry, there was an error translating your text. Please check your input and try again."
      );
    }
  }
});

// Welcome message
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
