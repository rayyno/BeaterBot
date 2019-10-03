const Discord = require("discord.js");
const ms = require("ms");

module.exports.run = async (bot, message, args, level) => {

  //!mute @user 1s/m/h/d

  let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if(!tomute) return message.channel.send("Please tag user to mute!");
  if(!message.member.hasPermission("ADMINSTRATOR")) return message.channel.send("Sorry, you don't have permissions to use this!");
  if(tomute.hasPermission("ADMINSTRATOR")) return message.channel.send("I cant mute this user");
  if (tomute.id === message.author.id) return message.channel.send("You cannot mute yourself!");
  let muterole = message.guild.roles.find(`name`, "Muted");

  if(!muterole){
    try{
      muterole = await message.guild.createRole({
        name: "Muted",
        color: "#000000",
        permissions:[]
      })
      message.guild.channels.forEach(async (channel, id) => {
        await channel.overwritePermissions(muterole, {
          SEND_MESSAGES: false,
          ADD_REACTIONS: false
        });
      });
    }catch(e){
      console.log(e.stack);
    }
  }

  let mutetime = args[1];
  if(!mutetime) return message.channel.send("You didn't specify a time!");

  await(tomute.addRole(muterole.id));
  message.reply(`<@${tomute.id}> has been muted for ${ms(ms(mutetime))}`);

  setTimeout(function(){
    tomute.removeRole(muterole.id);
    message.channel.send(`<@${tomute.id}> has been unmuted!`);
  }, ms(mutetime));

  message.delete();

}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Bot Admin"
};

exports.help = {
  name: "mute",
  category: "System",
  description: "Mute a user for a specific period of time/لإعطاء ميوت للشخص لمدة من الوقت",
  usage: "mute"
};
