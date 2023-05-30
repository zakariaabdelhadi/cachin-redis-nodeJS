const redis = require("redis");
const Redis = require('ioredis');
require('dotenv').config();

// Environment variables for cache
const cacheHostName = process.env.cacheHostName;
const cachePassword = process.env.cachePassword;


if (!cachePassword) throw Error("REDIS_ACCESS_KEY is empty")
if (!cacheHostName) throw Error("REDIS_HOST_NAME is empty")



async function connectToCache() {

    // Connection configuration
    const cacheConnection = redis.createClient({
        // rediss for TLS
        url: `rediss://${cacheHostName}:6380`,
        password: cachePassword
    });

    // Connect to Redis
    await cacheConnection.connect();

    return cacheConnection;


}


async function testCache() {

    let objektToPut = { "temp": 34, "humiditi": 79 };
    // Connection configuration
    const cacheConnection = redis.createClient({
        // rediss for TLS
        url: `rediss://${cacheHostName}:6380`,
        password: cachePassword
    });

    // Connect to Redis
    await cacheConnection.connect();


    // PING command
    console.log("\nCache command: PING");
    console.log("Cache response : " + await cacheConnection.ping());

    console.log("Cache response 2 : " + await cacheConnection.set('myKey', JSON.stringify(objektToPut), (err, reply) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Object stored in Redis');
            console.log('Reply: ' + reply);

        }
    }));

    // Retrieve the object from Redis and deserialize it

    console.log("Cache response 3 : " + await cacheConnection.get('myKey', (err, reply) => {
        if (err) {
            console.error(err);
        } else {
            console.log(reply);
            const deserializedObject = JSON.parse(reply);
            console.log(deserializedObject);
        }
    }));


    // Client list, useful to see if connection list is growing...
    console.log("\nCache command: CLIENT LIST");
    console.log("Cache response : " + await cacheConnection.sendCommand(["CLIENT", "LIST"]));

    // Disconnect
    cacheConnection.disconnect()

    return "Done"
}


//testCache().then((result) => console.log(result)).catch(ex => console.log(ex));
//connectToCache().then((result) => console.log(result)).catch(ex => console.log(ex));
module.exports = { testCache, connectToCache };