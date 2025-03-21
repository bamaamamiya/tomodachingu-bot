require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
} = require("discord.js");
const { translate } = require("@vitalets/google-translate-api");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const greetingCooldowns = new Map(); // userId -> timestamp

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// === MessageCreate Handler (for greetings & prefix commands) ===
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase().trim();
  const member = message.member;
  const displayName = member
    ? member.displayName || message.author.username
    : message.author.username;

  // Log message
  console.log(`Received message content: "${message.content}"`);
  console.log(`Normalized content: "${content}"`);

  const userId = message.author.id;
  const now = Date.now();
  const cooldownPeriod = 3 * 60 * 60 * 1000; // 3 jam dalam ms

  // Greetings
  const greetingsEn = [
    "hello",
    "hi",
    "hey",
    "heyy",
    "heii",
    "heyyy",
    "yo",
    "sup",
  ];
  const greetingsId = ["halo", "hai", "hei"];
  const greetingsJp = [
    "konichiwa",
    "konnichiwa",
    "こんにちは",
    "やあ",
    "おはよう",
    "こんばんは",
  ];
  const greetingsKr = ["annyeong", "안녕", "안녕하세요", "여보세요"];

  const greetedRecently = greetingCooldowns.get(userId);

  if (!greetedRecently || now - greetedRecently >= cooldownPeriod) {
    if (greetingsJp.some((greet) => content.includes(greet))) {
      message.reply(`Konnichiwa, ${displayName}! 🏯`);
      greetingCooldowns.set(userId, now);
    } else if (greetingsKr.some((greet) => content.includes(greet))) {
      message.reply(`Annyeong, ${displayName}! 🇰🇷`);
      greetingCooldowns.set(userId, now);
    } else if (greetingsId.some((greet) => content.includes(greet))) {
      message.reply(`Halo juga, ${displayName}! 🙌`);
      greetingCooldowns.set(userId, now);
    } else if (greetingsEn.some((greet) => content.includes(greet))) {
      message.reply(`Hello back, ${displayName}! 👋`);
      greetingCooldowns.set(userId, now);
    }
  } else {
    console.log(`Greeting cooldown active for ${displayName}. Skipping...`);
  }

  // Prefix commands
  if (content === "!help") {
    message.reply(
      `Hi ${displayName}! I'm **Tomodachingu Bot**, here to assist you! 🌏\nCommands:\n- !help: Show this help menu\n- !info: Information about Tomodachingu server\n- !translate <source_lang> <target_lang> <text>: Translate text`
    );
  } else if (content === "!info") {
    message.reply(
      `🌍 **Tomodachingu Server Info** 🌍\n` +
        `Tomodachingu is an international community where everyone can connect, learn, and share across cultures.\n\n` +
        `✨ We focus on language exchange, cultural learning, and creating a space where people from all backgrounds can share knowledge and experiences.\n\n` +
        `📌 Main Languages: English, 日本語, 한국어, Bahasa Indonesia\n` +
        `📌 Features: Language exchange, cultural discussions, learning resources, and friendly community vibes!\n\n` +
        `🕒 **Active Hours:**\n` +
        `- Indonesia (WIB): 6 PM - 12 AM\n` +
        `- Japan (JST): 8 PM - 2 AM\n` +
        `- Korea (KST): 8 PM - 2 AM\n` +
        `- USA (EST): 6 AM - 12 PM\n` +
        `- UK (GMT): 11 AM - 5 PM\n\n` +
        `Feel free to join anytime, but these are the peak hours when most members are active!\n\n` +
        `Welcome aboard, ${displayName}! 🎉`
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

// === Welcome Message ===
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
