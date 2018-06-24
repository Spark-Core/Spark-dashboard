module.exports = (service, id, email, name, app, req) => {
    var userData = {
        service,
        id,
        email,
        name,
        app,
        req
    }
    return new Promise(function(resolve, reject) {

        switch (service) {
            case "github":
                return verifyGithubAccount(userData, resolve, reject)
            case "discord":
                return verifyDiscordAccount(userData, resolve, reject)
            default:
                reject(404)
        }


    });
}


async function verifyGithubAccount(userData, resolve, reject) {
    var {
        r
    } = userData.app
    r
        .table('users')
        .filter(r.row("services").contains("github"))
        .filter({
            github_id: userData.id
        })
        .run(async (err, results) => {

            if (err) {
                return reject()
            }
            if (results.length == 0) {

                r.table("users").filter({
                        email: userData.email
                    })
                    .run(async (err, results) => {
                        if (err) {
                            return reject()
                        } else if (results == 0) {
                            var status = await createNewAccount(userData, {
                                "github_id": userData.id,
                                "services": ["github"],
                                "name": userData.name,
                                "email": userData.email
                            })
                        } else {
                            try {

                                var data = await linkAccount(userData, results[0], "github")
                                userData.req.session.user = data
                                resolve()
                            } catch (e) {
                                reject(e)
                            }
                        }
                    })

            } else {
                userData.req.session.user = results[0]
                resolve()
            }
        })
}

function linkAccount(userData, user, service) {
    return new Promise(function(resolve, reject) {

        console.log("linking account")
        var {
            r
        } = userData.app

        if (user.services.includes(service)) {
            return reject()
        }
        var data = {}
        user.services.push(service)
        data[service + "_id"] = userData.id
        data["services"] = user.services
        console.log(data)
        r.table("users").get(user.id).update(data).run((err, results) => {
            resolve(Object.assign(user, data))
        })
    });
}


async function verifyDiscordAccount(userData, resolve, reject) {
    var {
        r
    } = userData.app
    r
        .table('users')
        .filter(r.row("services").contains("discord"))
        .filter({
            discord_id: userData.id
        })
        .run(async (err, results) => {

            if (err) {
                return reject()
            }
            if (results.length == 0) {

                r.table("users").filter({
                        email: userData.email
                    })
                    .run(async (err, results) => {
                        if (err) {
                            return reject()
                        } else if (results == 0) {
                            var status = await createNewAccount(userData, {
                                "discord_id": userData.id,
                                "services": ["discord"],
                                "name": userData.name,
                                "email": userData.email
                            })
                        } else {
                            try {

                                var data = await linkAccount(userData, results[0], "discord")
                                userData.req.session.user = data
                                resolve()
                            } catch (e) {
                                reject(e)
                            }
                        }
                    })

            } else {
                userData.req.session.user = results[0]
                resolve()
            }
        })
}


function createNewAccount(userData, data) {
    return new Promise(function(resolve, reject) {
        var {
            r
        } = userData.app

        r.table('users')
            .insert(data)
            .run((err, results) => {
                if (err) {
                    return reject()
                } else {
                    if (results.inserted == 1) {
                        data.id = results.generated_keys[0]
                        return resolve(data)
                    } else {
                        reject()
                    }
                }
            })
    });
}





//