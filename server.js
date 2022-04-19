const express = require("express");
const app = express();
const cors = require("cors");
const socketio = require("socket.io");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const chat = require("./lib/chat");
const dbManager = require("./lib/dbManager");

require("dotenv").config();

dbManager.initialize();

const auth = require("./lib/auth");
auth.initialize(passport);

app.use(cors({ origin: "http://localhost:4000" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/views/public"));
app.set("view engine", "ejs");
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

const port = 4000;

app.get("/chat/login", auth.checkNotAuthenticated, function(req, res) {
    res.render("login");
});

app.post("/chat/login", passport.authenticate("local-login", {
        failureRedirect: "/chat/login",
        failureMessage: true
    }), function(req, res) {
        res.redirect("/chat");
    }
);

app.get("/chat/register", auth.checkNotAuthenticated, function(req, res) {
    res.render("register");
});

app.post("/chat/register", passport.authenticate("local-register", {
        failureRedirect: "/chat/register",
        failureMessage: true
    }), function(req, res) {
        dbManager.registerUsername(req.body.username, req.body.email);
        res.redirect("/chat");
    }
);

app.get("/chat", auth.checkAuthenticated, async function (req, res) {
    res.render("index", { rooms: await dbManager.getRooms() });
});

app.get("/chat/room/:roomID", auth.checkAuthenticated, async function (req, res) {
    const roomID = req.params.roomID;
    const rooms = await dbManager.getRooms();
    const room = await dbManager.getRoom(roomID);
    if (room) {
        rooms[roomID].selected = true;
    }
    res.render("index", { rooms: rooms, room: room, chat: chat});
});

const server = app.listen(port, () => {
    console.log("Listening on port " + port);
});

const io = socketio(server);

io.on("connection", socket => {
    console.log("New user connected");

    socket.username = "Anonymous";

    socket.on("change_username", data => {
        socket.username = data.username;
    });

    socket.on("send_message", data => {
        io.sockets.emit("receive_message", {message: data.message, username: socket.username, time: "00:00"});
    });
});