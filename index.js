const express = require('express');
const path = require('path');
const logger = require('./logger')
const router = require('./routes')
const bodyparser = require('body-parser')
require('dotenv').config();


const app = express();
const PORT = 5001 || process.env.PORT


app.use(logger);
app.use(express.json());
app.use("/api", router);


app.listen(PORT, () => {
    console.log(`app running on port: ${PORT}`)
})
