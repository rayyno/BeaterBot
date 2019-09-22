const client = new Discord.Client();
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    client.on('message', message => {
    if (message.content === 'كسمك') {
       message.reply('كسمك انت');
       }
});
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User"
};

exports.help = {
  name: "كسمك",
  category: "Miscelaneous",
  description: "كسمك انت",
  usage: "كسمك"
};
