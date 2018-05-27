module.exports = class userCache {
    constructor(app) {
        this.list = new Map()
        this.app = app
    }

    async fetch(id) {
        // returns false or user object
        var data = this
        if (data.list.has(id)) {
            return data.list.get(id)
        }
        return new Promise(function(resolve, reject) {
            data.app.r.db("spark").table("users").filter({
                id
            }).run((err, results) => {
                if (err) {
                    return resolve(false)
                } else if (results.length == 0) {
                    return resolve(false)
                }
                data.list.set(id, results[0])
                return resolve(results[0])

            })
        });
    }

}