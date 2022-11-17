require("dotenv")
const {
    Client,
    Util,
    Collection,
    MessageEmbed,
    Structures
} = require("discord.js");
const Discord = require('discord.js');
const client = new Client({
    disableEveryone: true
})
const keepAlive = require('./server.js')
keepAlive()

const config = require("./config.json")
const ServerID = config.GuildID
const channelID = config.CfsID
const LogChannel = config.CfsLogID
const Database = require("@replit/database")
const db = new Database()
const picExt = [".webp", ".png", ".jpg", ".jpeg", ".gif"];
const videoExt = [".webm", ".mp4", ".mov"];
async function createEmbed(text, message) {
    const newembed = new Discord.MessageEmbed()
        .setColor(`RANDOM`)
        .setDescription(text)
    return message.channel.send(newembed) //.then(msg=>msg.delete({timeout:60000}));
}
client.on('ready', async () => {
    //  console.clear()
    console.log(`${client.user.tag} est�� online!`)
    //await db.delete("CfsCount")

})
client.on('message', async (message, args) => {
    // cfs
    if (message.author.bot) return;
    let check = await db.get("CfsCount")
    if (check == null) db.set("CfsCount", 0)
    let checklogs = await db.get("logs")
    if (checklogs == null) db.set("logs", [])
    if (message.channel.type === "dm") {
        let CfsCount = await db.get("CfsCount")
        let logs = await db.get("logs")
        let userID = message.author.id
        if (message.content.startsWith(config.PREFIX.toLowerCase() + "cfs")) {

            var args = message.content.split(" ").slice(0)
            var args = args.slice(1).join(" ")
            if (!args) return createEmbed("`❌` **| Tienes que poner algo**", message)
            var guildID = ServerID


            createEmbed("`💌` **| ¡Tú confesion fue enviada!**", message).then(msg => msg.delete({
                timeout: `${10000}`
            }))
            CfsCount += 1;
            await db.set("CfsCount", CfsCount)
            logs.push(message.author.id)
            await db.set("logs", logs)

            if (args.length > 1024) return message.reply("Tu mensaje contiene muchos caracteres (Limite de 1024) :/")
            let embed = new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setTitle(`¡Nueva confesión! | Número #${CfsCount}`)
                .setDescription(args)
                .setFooter(`¡Enviame un md con ${config.PREFIX}cfs <mensaje>!`, client.user.displayAvatarURL())
                .setTimestamp()
            let embed1 = new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setAuthor(`Auditoria de confesión #${CfsCount}`, client.user.displayAvatarURL())
                .setDescription(args)
                .setFooter("Enviado por::  " + message.author.tag + " ", message.author.avatarURL)
                .setTimestamp()
            if (message.attachments.size > 0) {
                let attachment = message.attachments.first()
                picExt.forEach(async (ext) => {
                    if (attachment.name.endsWith(ext)) {
                        embed.setImage(attachment.url);
                        embed1.setImage(attachment.url);
                        client.guilds.cache.get(guildID).channels.cache.get(channelID).send(embed).catch(console.log(`Mensaje recibido por ${userID}!(${message.author.username}) en ${ServerID}`))
                        var channelIDS = LogChannel
                        if (channelIDS == "no-channel") return
                        client.guilds.cache.get(guildID).channels.cache.get(channelIDS).send(embed1)
                    }
                });
                videoExt.forEach(async (ext) => {
                    if (attachment.name.endsWith(ext)) {
                        client.guilds.cache.get(guildID).channels.cache.get(channelID).send(`**Nueva confesión #${CfsCount}**`, attachment).catch(console.log(`Mensaje por ${userID}!(${message.author.username}) en ${ServerID}`))
                        var channelIDS = LogChannel
                        if (channelIDS == "no-channel") return
                        client.guilds.cache.get(guildID).channels.cache.get(channelIDS).send(`**Nueva confesión #${CfsCount}\nConfesión por: ${message.author.tag}**`, attachment).catch(console.log(`Mensaje recibido por ${userID}!(${message.author.username}) en  ${ServerID}`))
                    }
                });
            } else {
                client.guilds.cache.get(guildID).channels.cache.get(channelID).send(embed).catch(console.log(`Mensaje recibido por ${userID}!(${message.author.username}) en ${ServerID}`))
                var channelIDS = LogChannel
                if (channelIDS === "no-channel") return
                client.guilds.cache.get(guildID).channels.cache.get(channelIDS).send(embed1)
            }

        } else if (message.content.startsWith(config.PREFIX.toLowerCase() + "reply")) {
            //let args = message.content.split(" ").slice(0)

            var args = message.content.split(" ").slice(0)
            var args = args.slice(1)

            let Rargs = message.content.split(" ").slice(2).join(" ")
            if (!args[0]) return createEmbed("**�?| Por favor, introduzca el número de confesiones**", message)
            if (isNaN(args[0])) return createEmbed("**�?| ¡Por favor ingrese un número entero!**", message)
            if (!args[1]) return createEmbed("**�?| ¡Por favor envía pon en la confesión!**", message)
            let userID = logs[args[0] - 1]
            try {
                if (message.author.bot) return;
                const member = client.users.fetch(userID).then(user => {

                    let embed = new Discord.MessageEmbed()
                        .setColor('#FFE9A7')
                        .setAuthor(`Alguien replico tu confesión`, client.user.avatarURL({
                            dynamic: true
                        }))
                        .setDescription(Rargs)
                        .setTimestamp()

                    user.send(embed)
                    console.log(`Se envio a ${userID}!`)
                })
                if (!member) return createEmbed("** No se pueden enviar mensajes a este usuario **", message)
                //   member.send(embed).catch(console.log(`Reply was sent to ${userID}!`))
                createEmbed("**¡Tú mensaje fue enviado!**", message).then(msg => msg.delete({
                    timeout: 10000
                }))
            } catch (error) {
                return createEmbed("** No se pueden enviar mensajes a este usuario **", message)
            }
        }
    }
});

client.login(process.env.token || config.TOKEN);