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
client.settings = new Enmap({name: "settings"});

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
      name: 'BEATMEATERS MAIN BOT',
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

/* For Invited by whom
client.on("ready", () => {
    var guild;
    while (!guild)
        guild = client.guilds.get("255962010368475137");
    guild.fetchInvites().then((data) => {
        data.forEach((Invite, key, map) => {
            var Inv = Invite.code;
            data[Inv] = Invite.uses;
        });
    });
});

client.on("guildMemberAdd", (member) => {
    let channel = member.guild.channels.get("255962010368475137");
    if (!channel) {
        console.log("!the channel id it's not correct");
        return;
    }
    if (member.id == client.user.id) {
        return;
    }
    console.log('-');
    var guild;
    while (!guild)
        guild = client.guilds.get("255962010368475137");
    guild.fetchInvites().then((data) => {
        data.forEach((Invite, key, map) => {
            var Inv = Invite.code;
            if (data[Inv])
                if (data[Inv] < Invite.uses) {
 channel.send(`تم دعوته بواسطة  ${Invite.inviter} `) ;         
 }
            data[Inv] = Invite.uses;
       
       });
    });
});*/

// For Sending Invite link to users
client.on('message', message => {
    if (message.content.startsWith("رابط")) {
        message.channel.createInvite({
        thing: true,
        maxUses: 1,
        maxAge: 3600,
    }).then(invite =>
      message.author.sendMessage(invite.url)
    )
    const embed = new Discord.RichEmbed()
        .setColor("RANDOM")
          .setDescription("تم أرسال الرابط برسالة خاصة")
           .setAuthor(client.user.username, client.user.avatarURL)
                 .setAuthor(client.user.username, client.user.avatarURL)
                .setFooter('طلب بواسطة: ' + message.author.tag)

      message.channel.sendEmbed(embed).then(message => {message.delete(10000)})
              const Embed11 = new Discord.RichEmbed()
        .setColor("RANDOM")
        
    .setDescription("** مدة الرابط : ساعه | عدد استخدامات الرابط : 1 **")
      message.author.sendEmbed(Embed11)
    }
}); 

// Broadcast Command
const prefix = "!";
client.on("message", message => {
	if (message.content.startsWith(prefix + "bc")) {
		if (!message.member.hasPermission("ADMINISTRATOR"))  return;
		let args = message.content.split(" ").slice(1);
		var argresult = args.join(' '); 
		message.guild.members.filter(m => m.presence.status !== 'offline').forEach(m => {
			m.send(`${argresult}\n ${m}`);
		})
		message.channel.send(`\`${message.guild.members.filter(m => m.presence.status !== 'online').size}\` : عدد الاعضاء المستلمين`); 
		message.delete(); 
	};     
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

// Fun Commands
client.on('message', message => {
    if (message.content === 'كسمك') {
       message.reply('كسمك انت');
       }
});


client.on('message', message => {
    if (message.content === 'مين سالب السيرفر') {
       message.reply('مجودي');
       }
});

/* Invite Tracking
// Initialize the invite cache
const invites = {};

// A pretty useful method to create a delay without blocking the whole script.
const wait = require('util').promisify(setTimeout);

client.on('ready', () => {
  // "ready" isn't really ready. We need to wait a spell.
  wait(1000);

  // Load all invites for all guilds and save them to the cache.
  client.guilds.forEach(g => {
    g.fetchInvites().then(guildInvites => {
      invites[g.id] = guildInvites;
    });
  });
});

client.on('guildMemberAdd', member => {
  // To compare, we need to load the current invite list.
  member.guild.fetchInvites().then(guildInvites => {
    // This is the *existing* invites for the guild.
    const ei = invites[member.guild.id];
    // Update the cached invites for the guild.
    invites[member.guild.id] = guildInvites;
    // Look through the invites, find the one for which the uses went up.
    const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
    // This is just to simplify the message being sent below (inviter doesn't have a tag property)
    const inviter = client.users.get(invite.inviter.id);
    // Get the log channel (change to your liking)
    const logChannel = member.guild.channels.find(channel => channel.name === "log");
    // A real basic message with the information we need. 
    logChannel.send(`${member.user.tag} joined using invite code ${invite.code} from ${inviter.tag}. Invite was used ${invite.uses} times since its creation.`);
  });
});*/

/*client.on("guildMemberAdd", member => {
  let welcomer = member.guild.channels.find("name","log");
        if(!welcomer) return;
        if(welcomer) {
           moment.locale('ar-ly');
           var h = member.user;
          let norelden = new Discord.RichEmbed()
          .setColor('RANDOM')
          .setThumbnail(h.avatarURL)
          .setAuthor(h.username,h.avatarURL)
	  .addField(': تاريخ دخولك الدسكورد',`${moment(member.user.createdAt).format('D/M/YYYY h:mm a')} **\n** \`${moment(member.user.createdAt).fromNow()}\``,true)
         // .addField(': تاريخ دخولك الدسكورد',`${moment(member.user.createdAt).format('D/M/YYYY h:mm a')} **n** `${moment(member.user.createdAt).fromNow()}``,true)            
           .addField(': تاريخ دخولك السيرفر',`${moment(member.joinedAt).format('D/M/YYYY h:mm a ')} n``${moment(member.joinedAt).startOf(' ').fromNow()}```, true) 
           .setFooter(`${h.tag}`,"https://images-ext-2.discordapp.net/external/JpyzxW2wMRG2874gSTdNTpC_q9AHl8x8V4SMmtRtlVk/https/orcid.org/sites/default/files/files/ID_symbol_B-W_128x128.gif")
       welcomer.send({embed:norelden});          
                 
   
        }
        });
		

const invites = {};
const wait = require('util').promisify(setTimeout);
client.on('ready', () => {
  wait(1000);
  client.guilds.forEach(king => {
    king.fetchInvites().then(guildInvites => {
      invites[king.id] = guildInvites;
    });
  });
});

client.on('guildMemberAdd', member => {
  member.guild.fetchInvites().then(guildInvites => {
    const gamer = invites[member.guild.id];
    invites[member.guild.id] = guildInvites;
    const invite = guildInvites.find(i => gamer.get(i.code).uses < i.uses);
    const inviter = client.users.get(invite.inviter.id);
    const welcome = member.guild.channels.find(channel => channel.name === "log");
    welcome.send(` ||${member.user.tag}|| invited by ||${inviter.tag}|| invites =  ||${invite.uses}|| `)
  });
});*/

client.login(process.env.TOKEN);

init();
