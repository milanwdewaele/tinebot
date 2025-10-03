# tinebot
Discord Bot voor PROG1

## Features
- 🛡️ Basic moderation commands
- 🎯 Prefix-based commands: `tine <command>`
- ⚡ Built with Discord.js v14

## Commands
- `tine mute @user [duration_minutes] [reason]` - Mute a user (default: 10 minutes)
- `tine unmute @user` - Unmute a user
- `tine kick @user [reason]` - Kick a user from the server
- `tine ban @user [reason]` - Ban a user from the server
- `tine unban <user_id>` - Unban a user by their ID
- `tine help` - Show help message

## Setup

### Prerequisites
- Node.js 16.9.0 or higher
- A Discord bot token

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/milanwdewaele/tinebot.git
   cd tinebot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Discord bot token:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

### Getting a Discord Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the token and paste it in your `.env` file
5. Enable the following Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent
6. Go to OAuth2 > URL Generator, select:
   - Scopes: `bot`
   - Bot Permissions: `Kick Members`, `Ban Members`, `Moderate Members`, `Read Messages/View Channels`, `Send Messages`, `Read Message History`
7. Use the generated URL to invite the bot to your server

### Running the Bot
```bash
npm start
```

## Bot Permissions Required
- Kick Members
- Ban Members
- Moderate Members (for timeout/mute)
- Read Messages/View Channels
- Send Messages
- Read Message History

## Usage Examples
```
tine mute @User 30 Spamming
tine unmute @User
tine kick @User Breaking rules
tine ban @User Repeated violations
tine unban 123456789012345678
tine help
```
