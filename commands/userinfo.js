const stripIndents = require('common-tags').stripIndents;
const commando = require('discord.js-commando');

exports.run = (client, message, args, level) => {

	async run(msg, args) {
		const member = args.member;
		const user = member.user;
		return msg.reply(stripIndents`
			Info on **${user.username}#${user.discriminator}** (ID: ${user.id})
			**❯ Member Details**
			${member.nickname !== null ? ` • Nickname: ${member.nickname}` : ' • No nickname'}
			 • Roles: ${member.roles.map(roles => `\`${roles.name}\``).join(', ')}
			 • Joined at: ${member.joinedAt}
			**❯ User Details**
			 • Created at: ${user.createdAt}${user.bot ? '\n • Is a bot account' : ''}
			 • Status: ${user.presence.status}
			 • Game: ${user.presence.game ? user.presence.game.name : 'None'}
		`);
	}

}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User"
};

exports.help = {
  name: "userinfo",
  category: "Miscelaneous",
  description: "Gets information about a user/ يعرض معلومات عن المستخدم",
  usage: "userinfo"
};
