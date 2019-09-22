client.on('message', message => {
    if (message.content === 'كسمك') {
       message.reply('كسمك انت');
       }
});

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Bot Admin"
};

exports.help = {
  name: "كسمك",
  category: "كس ام امك",
  description: "كس ام ام امك",
  usage: "كسمك"
};
