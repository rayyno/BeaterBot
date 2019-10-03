const Discord = require("discord.js");


exports.run = (client, message, args, level) => {
    

  const mentionedUser = message.mentions.users.first() || message.author;

  const embed = new Discord.RichEmbed()

    .setImage(mentionedUser.displayAvatarURL)
    .setColor("00ff00")
    .setTitle("Avatar")
    .setFooter("Requested by " + message.author.tag)
    .setDescription("[Avatar URL link]("+mentionedUser.displayAvatarURL+")");

  message.channel.send(embed)


  msg.delete();
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User"
};

exports.help = {
  name: "avatar",
  category: "Miscelaneous",
  description: "Send mentioned user avatar/ يرسل صورة العرض",
  usage: "avatar"
};

