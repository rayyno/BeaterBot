/* 	This will check if the node version you are running is the required Node version,
	if it isn't it will throw the following error to inform you. 		*/
if (Number(process.version.slice(1).split(".")[0]) < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");
/* global Map */
const http = require('http');
const express = require('express');
const Canvas = require('canvas');
const app = express();
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Discord = require('discord.js');
const config = require("./config.js");
const db = require('quick.db');
const cooldown = require("./cooldown.js");
const utils = require("./utils.js");
const client = new Discord.Client();
const active = new Map();
const Enmap = require("enmap");

// Here we load the config file that contains our token and our prefix values.
client.config = require("./config.js");

// Require our logger
client.logger = require("./modules/Logger");

// Let's start by getting some useful functions that we'll use throughout the bot, like logs and elevation features. //
require("./modules/functions.js")(client);

// Aliases and commands are put in collections where they can be read from, catalogued, listed, etc. //
client.commands = new Enmap();
client.aliases = new Enmap();

/* Now we integrate the use of Evie's awesome EnMap module, which essentially saves a collection to disk.
This is great for per-server configs, and makes things extremely easy for this purpose. */
//client.settings = new Enmap({name: "settings"});

app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 2800);

/*client.on("ready", () => {
	console.log("Bot started!\n\nUsers: " + client.users.size + "\nServers: " + client.guilds.size);
	client.user.setActivity(`${client.users.size} users`, {type: "Watching"});
});*/

client.on('ready', () => {
  console.log("Bot started!\n\nUsers: " + client.users.size + "\nServers: " + client.guilds.size);
  client.user.setStatus('available')
  client.user.setPresence({
    game: {
      name: 'wut',
      type: "STREAMING",
      url: "https://www.twitch.tv/reyyy"
    }
  });
});

// To let Bot join a voice channel and stay there //
client.on("ready", () => {
  const channel = client.channels.get("399123428503715842");
  if (!channel) return console.error("The channel does not exist!");
  channel.join().then(connection => {
    // Yay, it worked!
    console.log("Successfully connected.");
  }).catch(e => {
    // Oh no, it errored! Let's log it to console :)
    console.error(e);
  });
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

// Command Hanlder //
const init = async () => {

  // Here we load **commands** into memory, as a collection, so they're accessible
  // here and everywhere else.
  const cmdFiles = await readdir("./commands/");
  client.logger.log(`Loading a total of ${cmdFiles.length} commands.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    const response = client.loadCommand(f);
    if (response) console.log(response);
  });

  // Then we load events, which will include our message and ready event.
  const evtFiles = await readdir("./events/");
  client.logger.log(`Loading a total of ${evtFiles.length} events.`);
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    client.logger.log(`Loading Event: ${eventName}`);
    const event = require(`./events/${file}`);
    // Bind the client to any event, before the existing arguments
    // provided by the discord.js event. 
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, event.bind(null, client));
  });

  // Generate a cache of client permissions for pretty perm names in commands.
  client.levelCache = {};
  for (let i = 0; i < client.config.permLevels.length; i++) {
    const thisLevel = client.config.permLevels[i];
    client.levelCache[thisLevel.name] = thisLevel.level;
  }

};
client.login(process.env.TOKEN);

init();
