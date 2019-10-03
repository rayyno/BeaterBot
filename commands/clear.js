const Discord = require("discord.js");

module.exports.run = async (bot, message, args, level) => {
  if(args[0] == "help"){
    let helpembxd = new Discord.RichEmbed()
    .setColor("#00ff00")
    .addField("clear Command", "Usage: *clear <amount>")

    message.channel.send(helpembxd);
    return;
  } 

  message.delete()

  if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("You don't have premssions to do that!");
  if(!args[0]) return message.channel.send("Please enter a number of messages to clear! `Usage: !clear <amount>`");
  message.channel.bulkDelete(args[0]).then(() => {
  message.channel.send(`**__Cleared ${args[0]} messages.__**`).then(msg => msg.delete(2000));
});


}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Bot Admin"
};

exports.help = {
  name: "clear",
  category: "Miscelaneous",
  description: "Clears number of msgs from the chat/ يمسح عدد من الرسائل في الشات",
  usage: "clear"
};
