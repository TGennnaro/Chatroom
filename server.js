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
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
});
app.use(sessionMiddleware)
app.use(flash());
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

app.post("/chat/register", auth.registerUser, passport.authenticate("local-login", {
        failureRedirect: "/chat/register",
        failureMessage: true
    }), function(req, res) {
        res.redirect("/chat");
    }
);

app.get("/chat", auth.checkAuthenticated, async function (req, res) {
    res.render("index", {rooms: await dbManager.getRooms(), selectedNav: "Chats"});
});

app.get("/chat/discover", auth.checkAuthenticated, async function (req, res) {
    res.render("index", {rooms: await dbManager.getPublicRooms(), selectedNav: "Discover"});
});

app.get("/chat/room/:roomID", auth.checkAuthenticated, async function (req, res) {
    const roomID = req.params.roomID;
    let selected = req.query.selected;
    let rooms;
    if (selected != null && selected == "Discover") {
        rooms = await dbManager.getPublicRooms();
    } else {
        selected = "Chats";
        rooms = await dbManager.getRooms();
    }
    const room = await dbManager.getRoom(roomID);
    if (room) {
        rooms[roomID].selected = true;
    }
    res.render("index", { rooms: rooms, room: room, roomID: roomID, chat: chat, uid: req.user.id, selectedNav: selected});
});

const server = app.listen(port, () => {
    console.log("Listening on port " + port);
});

const io = socketio(server);

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
    if (socket.request.user) {
        next();
    } else {
        next(new Error("Unauthorized"));
    }
});

io.on("connection", socket => {
    const session = socket.request.session;
    session.socketId = socket.id;
    session.save();

    socket.roomID = socket.handshake.query.room;
    socket.join(socket.roomID);

    socket.emit("receive_username", {username: socket.request.user.username});

    socket.on("join_room", async d => {
        const currentMessages = Object.keys(d.messages);
        socket.listener = await dbManager.attachListener(socket.roomID, function(data) {
            if (data != null) {
                const newMessages = Object.keys(data).filter(n => !currentMessages.includes(n));
                for (let key of newMessages) {
                    if (data[key].message != null && data[key].poster != null) {
                        io.in(socket.roomID).emit("receive_message", {id: key, message: data[key].message, username: data[key].poster, time: "00:00"});
                        currentMessages.push(key);
                    }
                }
            }
        });

        socket.on("disconnect", () => {
            dbManager.detachListener(socket.listener);
            socket.leave(socket.roomID);
        });
    })

    socket.on("send_message", data => {
        dbManager.registerMessage(socket.roomID, data.message, socket.request.user.username, socket.request.user.id);
    });
});