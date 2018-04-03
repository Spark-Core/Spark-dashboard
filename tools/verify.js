module.exports = (service, id, email, name, app, req) => {
    return new Promise(async function(resolve, reject) {

        app.connection.query("select * from users where email = ?", [email], async (err, results) => {
            if (err) {
                console.log(err)
                reject(500)
                // TODO: implement a nice page.
            } else if (results.length == 0) {
                var result = await create(service, id, email, name, app, req)
                resolve(result)
            } else if (results[0].email == email && results[0][service + "_id"] == id) {
                var result = await login(results[0], app, req)
                console.log("test!")
                resolve(result)
            } else {
                var result = await link(service, id, email, app)
                resolve(result)
            }
        })


    });
}

async function create(service, id, email, name, app, req) {
    return new Promise(function(resolve, reject) {
        require('crypto').randomBytes(64, function(err, buffer) {
            var token = buffer.toString('hex');
            app.connection.query(`insert into users (email, name, ${service}_id, token) values (?, ?, ?, ?)`, [email, name, id, token], (err, results) => {
                if (err) {
                    console.log(err)
                    return reject(500)
                } else {
                    var result = {
                        email,
                        name,
                        token,
                    }
                    result[`${service}_id`] = id
                    return resolve(login(result, app, req))
                }
            })
        });
    });
}
async function login(user, app, req) {
    return new Promise(function(resolve, reject) {
        req.session.user = user;
        resolve(user)
    });
}