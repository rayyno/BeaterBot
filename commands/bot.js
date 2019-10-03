const Discord = require('discord.js');

exports.run = (client, message, args, level) => {

  const embed = new Discord.RichEmbed()
    .setColor([113, 149, 68])
    .setAuthor("Bot Information", client.user.avatarURL)
    .setDescription("Invitation [here](https://discordapp.com/api/oauth2/authorize?client_id=620366039514873876&permissions=0&scope=bot)!")
    .addField("Guilds", ":desktop: " + client.guilds.size, true)
    .addField("Users", ":joystick: " + client.users.size, true)
    .addField("Channels", ":page_facing_up: " + client.channels.size, true)
    .addField("Bot Version", "v1.0.0", true)
    .addField("Country", ":flag_sa: Saudi Arabia", true)
    .addField("Library", ":books: discord.js", true)
    .setFooter("made by reyy", client.user.avatarURL)
    .setTimestamp();

  message.channel.send(embed);

}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User"
};

exports.help = {
  name: "bot",
  category: "Miscelaneous",
  description: "Shows Bot Information/يعرض معلومات البوت",
  usage: "bot"
};
