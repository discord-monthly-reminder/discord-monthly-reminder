import fs from 'node:fs'
import path from 'node:path'

import { REST, Routes } from 'discord.js'

const clientId = process.env.DISCORD_CLIENT_ID || ''
const token = process.env.DISCORD_TOKEN || ''

const commands = []
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, '../', '../', 'discord-interaction-handler')
const commandFolders = fs.readdirSync(foldersPath)
console.log(`Found folders: ${commandFolders}`)

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = path.join(foldersPath, folder, 'dist')
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const command = require(filePath)
    if ('default' in command && 'data' in command.default && 'handler' in command.default)
      commands.push(command.default.data.toJSON())
    else
      console.warn(`The command at ${filePath} is missing a required "data" or "handler" property.`)
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    // The put method is used to fully refresh all commands in the guild with the current set
    const data: any = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    )

    console.log(`Successfully reloaded ${data.length} application (/) commands.`)
  }
  catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error)
  }
})()
