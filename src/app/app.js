const express = require("express");
const requestIp = require('request-ip');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');
const whiteListDomains = require('../utils/whiteListDomains');
const setRoutes = require('./routes');

const app = express();
const corsOptions = (req, callback) => {
    const { origin, accesstoken } = req.headers;
    // Define the shared config
    const commonCorsOptions = {
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
        ],
        exposedHeaders: ['set-cookie'],
    };

    if (origin && whiteListDomains.includes(origin)) {
        return callback(null, { ...commonCorsOptions, origin: true });
    }
    if (!origin && req.headers?.['user-agent']?.includes('postman')) {
        return callback(null, { ...commonCorsOptions, origin: true });
    }
    return callback({ message: 'Not allowed by CORS', statusCode: 403 });
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(requestIp.mw());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(mongoSanitize());
app.use(hpp());

require('./database')
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);

setRoutes(app);

app.all('*', (req, res) =>
    sendResponse.responseSend(
        `Can't find ${req.originalUrl} on this server!`,
        StatusCodes.NOT_FOUND,
        req.i18n.t('common.fail'),
        res
    )
);

module.exports = app;