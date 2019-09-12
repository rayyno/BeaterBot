const ytdl = require('ytdl-core');

exports.run = async (client, message, args, ops) => {
  
  if (!message.member.voiceChannel) return message.channel.send("Join a voice channel! / خليك جوا روم ي ذكي");
  
  if (message.guild.me.voiceChannel) return message.channel.send("I'm already playing music!");
  
  if (!args[0]) return message.channel.send("Insert a link!");
  
  let validate = await ytdl.validateURL(args[0]);
  
  if (!validate) return message.channel.send("lmao the video is blocked in your country! sad!");
  
  let info = await ytdl.getInfo(args[0]);
  
  let connection = await message.member.voiceChannel.join();
  
  await connection.playStream(ytdl(args[0], { filter: 'audioonly' }));
  
  message.channel.send(`Playing: **${info.title}**!`);
  
}
