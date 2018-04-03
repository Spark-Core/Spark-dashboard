const request = require("request")
const config = require("./../config.json")
const fs = require("fs")
var data = require("./../data/images.json")
module.exports = async (app) => {
    if (data.time > new Date().getTime()) {
        console.log("Reusing image database")
        return app.images = data.images;
    }
    try {

        request({
            uri: "https://api.unsplash.com/photos/random?collections=1946480&count=25",
            headers: {
                "Authorization": "Client-ID " + config.unsplash.key
            },
            json: true
        }, function(error, response, results) {
            if (error || response.statusCode != 200) {
                throw error;
            }
            build(results)
        })
    } catch (e) {
        return console.log(e)
    }

    function build(results) {
        var nrs = {
            done: 0,
            total: results.length
        }
        console.log("Started building image database")
        var images = []
        var iv = setInterval(async function() {
            var image = results[nrs.done]
            images.push({
                data_url: image.urls.raw,
                author: image.user.name,
                url: image.links.html
            })

            nrs.done = nrs.done + 1
            console.log("Image " + nrs.done + " / " + nrs.total + " has been built")
            if (nrs.done == nrs.total) {
                clearInterval(iv)
                done(images)
            }


        }, 250)
    }

    function done(images) {
        console.log("Finished building image database")
        console.log("Saving image database")
        var d = {
            time: (new Date().getTime() + 172800000),
            images
        }
        fs.writeFile(__dirname + "/../data/images.json", JSON.stringify(d), {
            encoding: "utf8"
        }, function(err) {
            if (err) {
                return console.log("Failed saving image database")
            }
            console.log("Successfully saved image database")
            app.images = images;
            data = d;
        })


    }

}