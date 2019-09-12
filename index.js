/* global Map */
const http = require('http');
const express = require('express');
const Canvas = require('canvas');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const Discord = require('discord.js');
const config = require("./config.json");
const db = require('quick.db');
const cooldown = require("./cooldown.js");
const utils = require("./utils.js");

const client = new Discord.Client();
client.prefix = config.prefix;

const active = new Map();

client.on("ready", () => {
  console.log("Bot started!\n\nUsers: " + client.users.size + "\nServidores: " + client.guilds.size);
  client.user.setActivity(`${client.users.size} users`, {type: "Watching"});
});

client.on("message", async message => {
  let msg = message.content.toLowerCase();
  if (message.author.bot) return undefined;
  let user = message.author;
  
  let xp = await db.fetch(`xp_${user.id}`);
  if (xp === null) xp = 0;
  let level = await db.fetch(`level_${user.id}`);
  if (level === null) level = 0;
  let total_points = await db.fetch(`total_points_${user.id}`);
  if (total_points === null) total_points = 0;
  
  if (!cooldown.is(user.id)) {
    cooldown.add(user.id);
    var add = Math.floor(Math.random() * 15) + 10;
    db.add(`xp_${user.id}`, add);
    db.add(`total_points_${user.id}`, add);
    setTimeout(() => {
      cooldown.remove(user.id);
    }, 1000 * 60);
  }
  
  while (xp >= utils.need(level+1)) {
    if (xp >= utils.need(level+1)) {
      db.subtract(`xp_${user.id}`, utils.need(level+1));
      db.add(`level_${user.id}`, 1);
      xp = await db.fetch(`xp_${user.id}`);
      level = await db.fetch(`level_${user.id}`);
      let embed = new Discord.RichEmbed()
        .setAuthor("LEVEL UP")
        .setDescription("You leveled up to **Level " + level + "** in beating the meat!")
        .setColor([54, 57, 163]);
      message.channel.send(embed);
    }
  }

  if (message.content.indexOf(client.prefix) !== 0) return;
  const args = message.content.slice(client.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  try {
    
    let ops = {
      active: active
    }
    
    let commands = require(`./commands/${command}.js`);
    commands.run(client, message, args, ops);
    
  } catch (e) {
    console.log(e);
  } finally {}

});


client.on("guildCreate", async guild => {
  client.channels.get('255962010368475137').send(`New server: **${guild.name}** (Owner: ${guild.owner.user.username})(Members: ${guild.memberCount})`);
});

client.on("guildDelete", async guild => {
  client.channels.get('255962010368475137').send(`Bye server: **${guild.name}**`);
});

const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');
	let fontSize = 70;

	do {
		ctx.font = `${fontSize -= 10}px sans-serif`;
	} while (ctx.measureText(text).width > canvas.width - 300);

	return ctx.font;
};

client.on('guildMemberAdd', async member => {
	const channel = member.guild.channels.find(ch => ch.id === '255962010368475137');
	if (!channel) return;

	const canvas = Canvas.createCanvas(700, 250);
	const ctx = canvas.getContext('2d');

	const background = await Canvas.loadImage('./wallpaper.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = '#74037b';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	ctx.font = '20px fantasy';
	ctx.fillStyle = '#ffffff';
	//ctx.fillText('𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 𝘽𝙀𝘼𝙏𝙈𝙀𝘼𝙏𝙀𝙍𝙎!', canvas.width / 2.5, canvas.height / 3.5);

	ctx.font = '20px fantasy';
	ctx.font = applyText(canvas, `${member.displayName}!`);
	ctx.fillStyle = '#ffffff';
	ctx.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

	ctx.beginPath();
	ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();

	const avatar = await Canvas.loadImage(member.user.displayAvatarURL);
	ctx.drawImage(avatar, 25, 25, 200, 200);

	const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');

	channel.send(`${member}, 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 𝘽𝙀𝘼𝙏𝙈𝙀𝘼𝙏𝙀𝙍𝙎! 𝙔𝙤𝙪𝙧 𝙛𝙖𝙥𝙥𝙞𝙣𝙜 𝙢𝙖𝙩𝙚𝙧𝙞𝙖𝙡 𝙬𝙞𝙡𝙡 𝙗𝙚 𝙙𝙚𝙡𝙞𝙫𝙚𝙧𝙚𝙙 𝙨𝙝𝙤𝙧𝙩𝙡𝙮. 𝙀𝙣𝙟𝙤𝙮 ;𝘿`, attachment);
});

client.on('message', async message => {
	if (message.content === '!join') {
		client.emit('guildMemberAdd', message.member || await message.guild.fetchMember(message.author));
	}
});

client.login(process.env.TOKEN);
