"use strict";
exports.__esModule = true;
var express_1 = require("express");
var mongoose_1 = require("mongoose");
var body_parser_1 = require("body-parser");
var swagger_jsdoc_1 = require("swagger-jsdoc");
var swagger_ui_express_1 = require("swagger-ui-express");
var socketIo = require('socket.io');
var app = express_1["default"]();
var port = process.env.PORT || 5000;
require("dotenv").config();
// MongoDB URI | Special
var uri = "mongodb+srv://" + process.env.MONGODB_USERNAME + ":" + process.env.MONGODB_PASSWORD + "cluster0-zlxgj.mongodb.net/" + process.env.MONGODB_DB_NAME;
// Imported Routes
var authRoutes_1 = require("./routes/authRoutes");
var apiRoutes_1 = require("./routes/apiRoutes");
var labelRoutes_1 = require("./routes/labelRoutes");
var projectRoutes_1 = require("./routes/projectRoutes");
var taskRoutes_1 = require("./routes/taskRoutes");
var swaggerRoutes_1 = require("./routes/swaggerRoutes");
var swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'DND Todo React Api',
            description: 'Fully fledged todo application built on top of the react.',
            contact: {
                name: 'DNDeveloper'
            },
            servers: ['http://localhost:' + port]
        }
    },
    apis: ['app.ts']
};
var swaggerDocs = swagger_jsdoc_1["default"](swaggerOptions);
app.use('/api-docs', swagger_ui_express_1["default"].serve, swagger_ui_express_1["default"].setup(swaggerDocs));
// Setting up api access permissions
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
// Setting up json parser
app.use(body_parser_1["default"].json());
// Serving static files with express
app.use(express_1["default"].static("public"));
// Setting up routes with some default
/**
 * @swagger
 *
 *   paths:
 *   /hello:
 *     # binds swagger app logic to a route
 *     x-swagger-router-controller: hello_world
 *     get:
 *       description: Returns 'Hello' to the caller
 *       # used as the method name of the controller
 *       operationId: hello
 *       parameters:
 *         - name: name
 *           in: query
 *           description: The name of the person to whom to say hello
 *           required: false
 *           type: string
 *       responses:
 *         "200":
 *           description: Success
 *         # responses may fall through to errors
 *         default:
 *           description: Error
 *           schema:
 *             $ref: "#/models/Label"
 */
app.use("/auth", authRoutes_1["default"]);
app.use('/api', apiRoutes_1["default"]);
app.use('/label', labelRoutes_1["default"]);
app.use('/project', projectRoutes_1["default"]);
app.use('/task', taskRoutes_1["default"]);
app.use(swaggerRoutes_1["default"]);
// Setting up special error middleware
app.use(function (err, req, res, next) {
    res.status = err.status || 500;
    res.send({
        type: "error",
        status: err.status || 500,
        message: err.message,
        errorKey: err.errorKey
    });
});
// Setting up connection to MongoDB
mongoose_1["default"].set("useNewUrlParser", true);
mongoose_1["default"].set("useUnifiedTopology", true);
mongoose_1["default"].connect(uri, { useFindAndModify: false }).then(function () {
    var server = app.listen(port);
    // Setting up connection to Socket.io
    // const io = require("./socket.ts")(server);
    var io = require("./socket")(server);
    app.set("socket.io", io);
    console.log("Sever listening to " + process.env.PORT || 5000);
});
