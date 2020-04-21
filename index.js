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
const RCONFIG = require('./config_role');
const prefix = '!';
const { Client, RichEmbed, Emoji, MessageReaction } = require('discord.js');

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
      url: "https://www.twitch.tv/reyyun"
    }
  });
	const channel = client.channels.get("695000053068333166");
	if (!channel) return console.error("The channel does not exist!");
	channel.join().then(connection => {
		// Yay, it worked!
		console.log("Successfully connected.");
	}).catch(e => {
		// Oh no, it errored! Let's log it to console :)
		console.error(e);
	});
});

/* To let Bot join a voice channel and stay there //
client.on("ready", () => {
  const channel = client.channels.get("695000053068333166");
  if (!channel) return console.error("The channel does not exist!");
  channel.join().then(connection => {
    // Yay, it worked!
    console.log("Successfully connected.");
  }).catch(e => {
    // Oh no, it errored! Let's log it to console :)
    console.error(e);
  });
}); */


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

// Invite Tracker
client.on('message',message =>{

    if(message.content.startsWith(prefix + 'topinv')) {
  message.guild.fetchInvites().then(i =>{
  var invites = [];
   
  i.forEach(inv =>{
    var [invs,i]=[{},null];
     
    if(inv.maxUses){
        invs[inv.code] =+ inv.uses+"/"+inv.maxUses;
    }else{
        invs[inv.code] =+ inv.uses;
    }
        invites.push(`invite: ${inv.url} inviter: ${inv.inviter} \`${invs[inv.code]}\`;`);
   
  });
  var embed = new Discord.RichEmbed()
  .setColor("#000000")
  .setDescription(`${invites.join(`\n`)+'\n\n**By:** '+message.author}`)
  .setThumbnail(client.user.avatarURL)
           message.channel.send({ embed: embed });
   
  });
   
    }
  });

// Broadcast Command
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
	if (message.content === 'مين سالب السيرفر') {
       message.reply('مجودي');
       }
	if (message.content === 'مين كتبلك') {
       message.reply('صحبتي😳💓');
       }
	if (message.content === 'طيب مين كتبلك') {
       message.reply('صحبتي😳💓');
       }
	if (message.content === 'مين عم السيرفر') {
       message.reply('العم تشاوس');
       }

});

// If there isn't a reaction for every role, alert the user
if (RCONFIG.roles.length !== RCONFIG.reactions.length)
    throw "Roles list and reactions list are not the same length! Please double check this in the config.js file";

// Function to generate the role messages, based on your settings
function generateMessages() {
    return RCONFIG.roles.map((r, e) => {
        return {
            role: r,
            message: `React below to get the **"${r}"** role!`, //DONT CHANGE THIS,
            emoji: RCONFIG.reactions[e]
        };
    });
}

// Function to generate the embed fields, based on your settings and if you set "const embed = true;"
function generateEmbedFields() {
    return RCONFIG.roles.map((r, e) => {
        return {
            emoji: RCONFIG.reactions[e],
            role: r
        };
    });
}

// Client events to let you know if the bot is online and to handle any Discord.js errors
client.on("ready", () => console.log("Role Reactions is online!"));
client.on('error', console.error);

// Handles the creation of the role reactions. Will either send the role messages separately or in an embed
client.on("message", message => {
  
  if (message.content === '!roles'){
        // Make sure bots can't run this command
    if (message.author.bot) return;

    // Make sure the command can only be ran in a server
    if (!message.guild) return;

    // We don't want the bot to do anything further if it can't send messages in the channel
    if (message.guild && !message.channel.permissionsFor(message.guild.me).missing('SEND_MESSAGES')) return;

    if ((message.author.id !== RCONFIG.yourID) && (message.content.toLowerCase() !== RCONFIG.setupCMD)) return;

    if (RCONFIG.deleteSetupCMD) {
        const missing = message.channel.permissionsFor(message.guild.me).missing('MANAGE_MESSAGES');
        // Here we check if the bot can actually delete messages in the channel the command is being ran in
        if (missing.includes('MANAGE_MESSAGES'))
            throw new Error("I need permission to delete your command message! Please assign the 'Manage Messages' permission to me in this channel!");
        message.delete().catch(O_o=>{});
    }

    const missing = message.channel.permissionsFor(message.guild.me).missing('MANAGE_MESSAGES');
    // Here we check if the bot can actually add recations in the channel the command is being ran in
    if (missing.includes('ADD_REACTIONS'))
        throw new Error("I need permission to add reactions to these messages! Please assign the 'Add Reactions' permission to me in this channel!");

    if (!RCONFIG.embed) {
        if (!RCONFIG.initialMessage || (RCONFIG.initialMessage === '')) 
            throw "The 'initialMessage' property is not set in the config.js file. Please do this!";

        message.channel.send(RCONFIG.initialMessage);

        const messages = generateMessages();
        for (const { role, message: msg, emoji } of messages) {
            if (!message.guild.roles.find(r => r.name === role))
                throw `The role '${role}' does not exist!`;

            message.channel.send(msg).then(async m => {
                const customCheck = message.guild.emojis.find(e => e.name === emoji);
                if (!customCheck) await m.react(emoji);
                else await m.react(customCheck.id);
            }).catch(console.error);
        }
    } else {
        if (!RCONFIG.embedMessage || (RCONFIG.embedMessage === ''))
            throw "The 'embedMessage' property is not set in the config.js file. Please do this!";
        if (!RCONFIG.embedFooter || (RCONFIG.embedMessage === ''))
            throw "The 'embedFooter' property is not set in the config.js file. Please do this!";

        const roleEmbed = new RichEmbed()
            .setDescription(RCONFIG.embedMessage)
            .setFooter(RCONFIG.embedFooter);

        if (RCONFIG.embedColor) roleEmbed.setColor(RCONFIG.embedColor);

        if (RCONFIG.embedThumbnail && (RCONFIG.embedThumbnailLink !== '')) 
            roleEmbed.setThumbnail(RCONFIG.embedThumbnailLink);
        else if (RCONFIG.embedThumbnail && message.guild.icon)
            roleEmbed.setThumbnail(message.guild.iconURL);

        const fields = generateEmbedFields();
        if (fields.length > 25) throw "That maximum roles that can be set for an embed is 25!";

        for (const { emoji, role } of fields) {
            if (!message.guild.roles.find(r => r.name === role))
                throw `The role '${role}' does not exist!`;

            const customEmote = client.emojis.find(e => e.name === emoji);
            
            if (!customEmote) roleEmbed.addField(emoji, role, true);
            else roleEmbed.addField(customEmote, role, true);
        }

        message.channel.send(roleEmbed).then(async m => {
          for (const r of RCONFIG.reactions) {
            const emoji = r;
            const customCheck = client.emojis.find(e => e.name === emoji);
            if (!customCheck) await m.react(emoji);
            else await m.react(customCheck.id);
          }
        });

    }
  };

});

// This makes the events used a bit more readable
const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

// This event handles adding/removing users from the role(s) they chose based on message reactions
client.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id);

    const message = await channel.fetchMessage(data.message_id);
    const member = message.guild.members.get(user.id);

    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let reaction = message.reactions.get(emojiKey);

    if (!reaction) {
        // Create an object that can be passed through the event like normal
        const emoji = new Emoji(client.guilds.get(data.guild_id), data.emoji);
        reaction = new MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }

    let embedFooterText;
    if (message.embeds[0]) embedFooterText = message.embeds[0].footer.text;

    if (
        (message.author.id === client.user.id) && (message.content !== RCONFIG.initialMessage || 
        (message.embeds[0] && (embedFooterText !== RCONFIG.embedFooter)))
    ) {

        if (!RCONFIG.embed && (message.embeds.length < 1)) {
            const re = `\\*\\*"(.+)?(?="\\*\\*)`;
            const role = message.content.match(re)[1];

            if (member.id !== client.user.id) {
                const guildRole = message.guild.roles.find(r => r.name === role);
                if (event.t === "MESSAGE_REACTION_ADD") member.addRole(guildRole.id);
                else if (event.t === "MESSAGE_REACTION_REMOVE") member.removeRole(guildRole.id);
            }
        } else if (RCONFIG.embed && (message.embeds.length >= 1)) {
            const fields = message.embeds[0].fields;

            for (const { name, value } of fields) {
                if (member.id !== client.user.id) {
                    const guildRole = message.guild.roles.find(r => r.name === value);
                    if ((name === reaction.emoji.name) || (name === reaction.emoji.toString())) {
                        if (event.t === "MESSAGE_REACTION_ADD") member.addRole(guildRole.id);
                        else if (event.t === "MESSAGE_REACTION_REMOVE") member.removeRole(guildRole.id);
                    }
                }
            }
        }
    }
});

process.on('unhandledRejection', err => {
    const msg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
	console.error("Unhandled Rejection", msg);
});

///////////////////// SEND DM ////////////////////////////////////////////////////////

client.on("message", msg => {
  let msgarray = msg.content.split(" ");
  let cmd = msgarray[0];
  let args = msgarray.slice(1);  
if(cmd === `${prefix}dm`){
  let mentions = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]));
  if(!mentions) return msg.reply("**منشن العضو**").then(men => {
      men.delete(2222)
      msg.delete()
  })
  let args2 = args.join(" ").slice(22);
  if(!args2) return msg.reply("**اكتب الرسالة**").then(am => {
      am.delete(2222)
      msg.delete()
  })
let emb = new Discord.RichEmbed()
.setTitle("**DM**")
.addField("**الرسالة**", args2)
.addField("**الرسالة لـ**", mentions)
.addField("**من قبل**", msg.author)
.setDescription(`**هل انت متاْكد برسالتك؟
✔ | نعم

❌ | لا**`)
msg.channel.send(emb).then(od => {
  od.react("✔")
  .then(()=> od.react("✔"))
  .then(()=> od.react("❌"))
  let reaction1Filter = (reaction, user) => reaction.emoji.name === '✔' && user.id === msg.author.id;
let reaction2Filter = (reaction, user) => reaction.emoji.name === '❌' && user.id === msg.author.id;

let reaction1 = od.createReactionCollector(reaction1Filter, { time: 12000 });
let reaction2 = od.createReactionCollector(reaction2Filter, { time: 12000 });
reaction2.on("collect", r => {
msg.reply("**تم الغاء رسل رسالتك بنجاح**").then(cn => {
cn.delete(2222)
msg.delete()
})
od.delete(2222)
})
reaction1.on("collect", r => {
let embd = new Discord.RichEmbed()
.setTitle("**DM**")
.setDescription(`** الرسالة نوع ايش ؟ :arrow_down:
🚩 | Embed

✨ | No Embed
**`)
msg.delete()
od.delete(2222)
msg.channel.send(embd).then(bo => {
bo.react("🚩")
.then(() => bo.react("🚩"))
.then(() => bo.react("✨"))
let r1 = (reaction, user) => reaction.emoji.name === '🚩' && user.id === msg.author.id;
let r2 = (reaction, user) => reaction.emoji.name === '✨' && user.id === msg.author.id;

let rec1 = bo.createReactionCollector(r1, { time: 12000 });
let rec2 = bo.createReactionCollector(r2, { time: 12000 });
rec1.on("collect", r => {
let embde = new Discord.RichEmbed()
.setTitle("**رسالة**")
.addField("**الرسالة**", args2)
.addField("**من قبل**", msg.author)
bo.delete(2222)
msg.reply("**تم ارسال الرسالة بنجاح ✔**").then(op => {
  op.delete(2222)
  msg.delete()
})
mentions.send(embde)
})
rec2.on("collect", r => {
  mentions.send(args2)
  msg.reply("**تم ارسال الرسالة بنجاح ✔**").then(ede => {
      ede.delete(2222)
      bo.delete(2222)
      msg.delete()
     
  })
  })

})

}) 
})
}
})

////////////////////////////////////////

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

///////////////////////IVNITED BY///////////////////////////////////////////////////////////
/*client.on("guildMemberAdd", member => { 
var embed = new Discord.RichEmbed()
    .setThumbnail(member.user.avatarURL) 
    .addField("**Thank You For Joining**", `<@${member.id}>`)
    .setColor("#0984e3") 
    .setImage("https://cdn.discordapp.com/attachments/607046676984758383/650554313818767361/p_1225y7yza1.gif"); 
    
  var channel = member.guild.channels.find("name", "𝑩𝑬𝑨𝑻𝑴𝑬𝑨𝑻𝑬𝑹𝑺");         
  if (!channel) return; 
  channel.send({ embed: embed }); 
}); */

const invites = {}; 
const wait = require("util").promisify(setTimeout); 
client.on("ready", () => {

  wait(1000); 
  client.guilds.forEach(king => {
 
    king.fetchInvites().then(guildInvites => {

      invites[king.id] = guildInvites; 
  
    }); 
  }); 
}); 

client.on("guildMemberAdd", member => {
  member.guild.fetchInvites().then(guildInvites => {
 
    const gamer = invites[member.guild.id]; 
    invites[member.guild.id] = guildInvites; 
   const invite = guildInvites.find(i => gamer.get(i.code).uses < i.uses);
    const inviter = client.users.get(invite.inviter.id); 
    const welcome = member.guild.channels.find(
    
      channel => channel.name === "𝑩𝑬𝑨𝑻𝑴𝑬𝑨𝑻𝑬𝑹𝑺"      
    ); 
    welcome.send(
`{<@${member.id}>} **invited by** {<@${inviter.id}>}`
    ); 
  }); 
}); 

//////////////////////////////////// Jail Command /////////////////////////////////////////////////
// Returns the first voice channel named "jail" 
/*
function getJailChannel(guild)
{
    return guild.channels.find(channel => channel.type === "voice" && channel.name.toLowerCase() === "🔒 ❌Jail❌ 🔒");
}

// Checks if anybody should be moved to the jail
function jailCheck(guild, member)
{
    if(!member.roles.find(e => e.name.toLowerCase() === "🍆 𝑩𝑬𝘼𝙏 𝑴𝑬𝘼𝙏𝑬𝑹𝙎")) return;
    
    if(typeof member.voiceChannel !== "undefined" && member.voiceChannel.name !== getJailChannel(guild).name)
    {
        member.setVoiceChannel(getJailChannel(guild))
            .catch(err => {
                console.log("Failed to move member: " + err);
            });
    }
}

// Quit process on warnings
process.on("warning", function(warn){
    process.exit(1);
});

// On client ready
client.on("ready", function(){
    console.log("Bot online!");
})

/* Message event listener
client.on("message", async function(msg){

    // Ignore the message if it wasn't in a server text channel,
    // sent by a bot, or doesn't start with the prefix
    if(msg.channel.type !== "text") return;
    if(msg.author.bot) return;
    if(!msg.content.startsWith(cfg.prefix)) return;

    // Removes the prefix and leading/trailing whitespace and puts the command message into a string[]
    const args = msg.content.slice(cfg.prefix.length).trim().split(/ +/g);
    // Removes the first word of the arguments and puts it into a separate string
    const cmd = args.shift().toLowerCase();
*/
    /* HELP COMMAND
    if(cmd === "help")
    {
        var output = "";
        output += "Hello! My commands are as follows:\n";
        output += "```\n";
        
        cfg.commands.forEach(element => {
            output += `${cfg.prefix}${element.name} - ${element.desc}\n`;
        });

        output += "```\n";

        sendMessage(msg.channel, output);
    } 

    if(cmd === `${prefix}jail`)
    {
        // First, verify if a valid user was mentioned
        var member = msg.mentions.members.first();
        if(typeof member === "undefined")
        {
            sendMessage(msg.channel, "You must mention a valid user!");
            return;
        }

        // Verify that the guild does have a role named "jailed"
        var jailedRole = msg.guild.roles.find(role => role.name.toLowerCase() === "🔒 Jail");
        if(jailedRole === null)
        {
            sendMessage(msg.channel, "This guild does not have a \"Prisonnier\" role!");
            return;
        }

        // Verify if bot has the permissions to punish this user accordingly
        if(!member.manageable)
        {
            sendMessage(msg.channel, "I don't have the permissions necessary to punish this member!");
            return;
        }

        // Remove all their roles
        member.roles.forEach(role => {
            member.removeRole(role.id)
                .catch(err => {
                    console.log("Failed to remove role: " + err);
                });
        });

        // Give them the jailed role
        member.addRole(jailedRole.id)
            .catch(err => {
                console.log("Failed to add role: " + err);
            });


        // Send the response message
        sendMessage(msg.channel, "Jailed " + member.displayName + "!");

        // Immediately do a check to see if the member should be moved to the jail
        jailCheck(msg.guild);
    }
});

// Whenever anyone switches channels, perform a jail check
client.on("voiceStateUpdate", function(o, n){
    jailCheck(n.guild, n);
}); */
////////////////////////////////////////////////////////////////////////////////////////////

client.login(process.env.TOKEN);

init();
