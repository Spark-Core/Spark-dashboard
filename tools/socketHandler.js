module.exports = (app) => {
    app.sio.on("connection", (socket) => {
        socket.on("userUpdate", async (userData) => {
            console.log(await checkUserData(app, userData))
        })
    })
}

async function checkUserData(app, data) {
    if (!typeof data.bot_name == "string") {
        return false
    }
    if (!data.bot_name.match(/.{1,32}#[0-9]{4}/gi)) {
        return false
    }
    if (!data.bot_name.length >= 36) {
        return false
    }
    if (isNaN(data.bot_id)) {
        return false
    }
    try {
        await app.client.fetchUser(data.bot_id)
    } catch (e) {
        console.log(e)
        return false;
    }
    if (!app.client.users.get(data.bot_id).bot) {
        return false;
    }
    if (!data.icon.match(/https:\/\/(cdn.|)discordapp\.com\/(avatars|assets)\/?[0-9]*?\/[0-9a-zA-Z]*.png/gi)) {
        return false
    }
    return true;
}