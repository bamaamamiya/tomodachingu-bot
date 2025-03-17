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

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const guildId = "YOUR_GUILD_ID"; // Ganti dengan server ID kamu
  const commands = [
    new SlashCommandBuilder()
      .setName("help")
      .setDescription("Show help menu"),
    new SlashCommandBuilder()
      .setName("info")
      .setDescription("Show server info"),
    new SlashCommandBuilder()
      .setName("rules")
      .setDescription("Show server rules"),
    new SlashCommandBuilder()
      .setName("faq")
      .setDescription("Show frequently asked questions"),
    new SlashCommandBuilder()
      .setName("translate")
      .setDescription("Translate text between languages")
      .addStringOption(option =>
        option.setName("source_lang")
          .setDescription("Source language code (e.g., en, ja)")
          .setRequired(true))
      .addStringOption(option =>
        option.setName("target_lang")
          .setDescription("Target language code (e.g., en, ja)")
          .setRequired(true))
      .addStringOption(option =>
        option.setName("text")
          .setDescription("Text to translate")
          .setRequired(true))
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, guildId),
      { body: commands }
    );
    console.log('Slash commands registered!');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;
  const displayName = interaction.member ? interaction.member.displayName || interaction.user.username : interaction.user.username;

  if (commandName === "help") {
    await interaction.reply(`Hi ${displayName}! I'm **Tomodachingu Bot**, here to assist you! 🌏\nCommands:\n- /help: Show help menu\n- /info: Information about Tomodachingu server\n- /rules: Show server rules\n- /faq: Show frequently asked questions\n- /translate <source_lang> <target_lang> <text>`);
  } else if (commandName === "info") {
    await interaction.reply(`🌍 **Tomodachingu Server Info** 🌍\nTomodachingu is an international community where everyone can connect, learn, and share across cultures.\n\n✨ We focus on language exchange, cultural learning, and creating a space where people from all backgrounds can share knowledge and experiences.\n\n📌 Main Languages: English, 日本語, 한국어, Bahasa Indonesia\n📌 Features: Language exchange, cultural discussions, learning resources, and friendly community vibes!\n\n🕒 **Active Hours:**\n- Indonesia (WIB): 6 PM - 12 AM\n- Japan (JST): 8 PM - 2 AM\n- Korea (KST): 8 PM - 2 AM\n- USA (EST): 6 AM - 12 PM\n- UK (GMT): 11 AM - 5 PM\n\nFeel free to join anytime, but these are the peak hours when most members are active!\n\nWelcome aboard, ${displayName}! 🎉`);
  } else if (commandName === "rules") {
    await interaction.reply(`📜 **Tomodachingu Server Rules** 📜\n1️⃣ Be respectful to all members.\n2️⃣ No spamming or flooding the chat.\n3️⃣ Keep discussions appropriate and safe for everyone.\n4️⃣ Use channels for their intended purposes.\n5️⃣ No self-promotion or advertisements without permission.\n\nBreaking these rules may result in warnings or bans. Let's keep Tomodachingu friendly and fun! ✨`);
  } else if (commandName === "faq") {
    await interaction.reply(`❓ **Tomodachingu FAQ** ❓\n**Q: What is Tomodachingu?**\nA: Tomodachingu is an international community focused on language exchange and cultural learning.\n\n**Q: What languages are spoken here?**\nA: English, 日本語, 한국어, Bahasa Indonesia.\n\n**Q: Can I promote my server/product here?**\nA: No self-promotion without permission.\n\nFor more questions, feel free to ask the mods! 🌏`);
  } else if (commandName === "translate") {
    const sourceLang = options.getString("source_lang");
    const targetLang = options.getString("target_lang");
    const text = options.getString("text");
    try {
      const res = await translate(text, { from: sourceLang, to: targetLang });
      await interaction.reply(`Translated (${sourceLang} → ${targetLang}): ${res.text}\n\nSorry if the translation isn't perfect!🙏`);
    } catch (error) {
      console.error("Translation error:", error);
      await interaction.reply("Sorry, there was an error translating your text. Please check your input and try again.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
