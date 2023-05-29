const path = require('path');



//logger Middleware, loggt wenn eine request kommt + access to req and response
const logger = (req, res, next) => {
    //console.log(path.join(req.protocol,"/",req.hostname));
    console.log('request to retrieve current wetter daten ..'),
        console.log('Api Key : ' + process.env.OPEN_WEATHER_API);

    next();
};

module.exports = logger;