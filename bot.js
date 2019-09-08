const Discord = require('discord.js');

const client = new Discord.Client();

 

client.on('ready', () => {

    console.log('I am ready!');

});

client.on("ready", () => {
  const channel = client.channels.get("mychannelid");
  if (!channel) return console.error("The channel does not exist!");
  channel.join().then(connection => {
    // Yay, it worked!
    console.log("Successfully connected.");
  }).catch(e => {
    // Oh no, it errored! Let's log it to console :)
    console.error(e);
  });
});

client.on('message', message => {

    if (message.content === 'كسمك') {

       message.reply('كسمك انت');

       }

});

client.on('message', message => {

    if (message.content === 'مين سالب السيرفر؟') {

       message.reply('مجودي');

       }

});

client.on('message', message => {

    if (message.content === 'هل الزنا حلال؟') {

       message.reply('والله على حسب');

       }

});

client.on('message', message => {

    if (message.content === 'سب الام') {

       message.reply('زي السلامعليكم عندكم');

       }

});

 

// THIS  MUST  BE  THIS  WAY

client.login(process.env.BOT_TOKEN);//where BOT_TOKEN is the token of our bot
