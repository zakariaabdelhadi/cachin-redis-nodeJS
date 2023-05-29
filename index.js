const express = require('express');
const path = require('path');
const logger = require('./logger')
const router = require('./routes')
const bodyparser = require('body-parser')
const { testCache, connectToCache, disconnectFromCache } = require('./caching')
const dotEnv = require('dotenv')

const app = express();
const PORT = 5001 || process.env.PORT

dotEnv.config();
app.use(logger);
app.use(express.json());
app.use("/api", router);





testCache().then((result) => console.log(result)).catch(ex => console.log(ex));
//connectToCache().then((result) => console.log(result)).catch(ex => console.log(ex));

app.listen(PORT, () => {
    console.log(`app running on port: ${PORT}`)
})
