const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      runIn: ['text', 'group'],
      requiredPermissions: ['EMBED_LINKS'],
      cooldown: 5,
      description: (lang) => lang.get('SLAP_DESCRIPTION'),
      usage: '<member:member>',
    });
  }

  async run(msg, [member]) {
    try {
      const author = msg.author;
      const user = member.user;
      const data = await (await fetch('https://nekos.life/api/v2/img/slap')).json();
      if (!(data || data.url)) return msg.sendError('NO_DATA');
      msg.genEmbed()
          .setEmoteTitle(author.username, user.username, 'SLAPPING', true)
          .setProvidedBy('nekos.life')
          .setImage(data.url)
          .send();
    } catch (error) {
      return msg.sendError('REQUEST_FAILED');
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User"
};

exports.help = {
  name: "slap",
  category: "Miscelaneous",
  description: "Slaps a user/ كف",
  usage: "slap"
};
