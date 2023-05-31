const express = require('express')
const router = express.Router();
const fetch = require('node-fetch');
const { connectToCache } = require('./caching')



router.get("/wetter-current", cach, async (req, res) => {

    let stadt = req.query.stadt;
    let unit = req.query.unit;
    let client = await connectToCache();

    console.log(await client.ping());
    await getWeatherFromAPI(req, res, stadt, unit, client)

});


//Middleware für cachcheck
async function cach(req, res, next) {

    let stadt = req.query.stadt;
    let unit = req.query.unit;
    let client = await connectToCache();

    // await client.flushAll();
    let dataFromCach = await client.get(stadt + unit, (err, reply) => {
        if (err) {
            console.error(err);
        } else {
            console.log(reply);
            const deserializedObject = JSON.parse(reply);
            return deserializedObject;
        }
    });

    if (dataFromCach) {
        let datacach = JSON.parse(dataFromCach);
        res.render('index', { data: datacach });
        // res.json(JSON.parse(dataFromCach));
    } else {
        next();
    }
}

async function getWeatherFromAPI(req, res, stadt, unit, client) {

    let apiLink = `https://api.openweathermap.org/data/2.5/weather?q=${stadt}&appid=${process.env.OPEN_WEATHER_API}&units=${unit}`
    try {

        console.log('try to fetching Data from API ...')
        fetch(apiLink)
            .then(async fetchres => fetchres.json())
            .then(async json => {

                let data = {
                    dt: unix_to_date(json.dt),
                    date: get_currentTime(),
                    temperatur: json.main.temp, // celcius
                    Luftfeuchtigkeit: json.main.humidity, // porcentage
                    Windgeschwindigkeit: json.wind.speed // meter per sekunde

                }

                await PutToCache(client, stadt + unit, data);
                res.render('index', { data: data });
                //  res.json(data);


            });

    } catch (error) {
        res.status(500).send('Internal server Error')
    }
}


async function PutToCache(cacheConnection, key, value) {

    let delai = 15 - (new Date(get_currentTime()).getMinutes() - new Date(value.dt).getMinutes());
    console.log(delai);

    await cacheConnection.set(key, JSON.stringify(value), 'EX', delai * 60, async (err, reply) => {
        if (err) {
            console.error(err);
        } else {
            await console.log('data stored in Redis ...');
            await console.log('Reply: ' + reply);
            cacheConnection.disconnect();

        }
    });
    setInterval(cachLeeren, delai * 60 * 1000)

}
function get_currentTime() {

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function unix_to_date(dt) {

    var now = new Date(dt * 1000);
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;


}

async function cachLeeren() {

    let client = await connectToCache();
    client.flushAll();
}

module.exports = router;
//