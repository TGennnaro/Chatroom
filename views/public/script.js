const username = "TGennaro";

let socket;
let log;
let input;
let send;

(function init() {
    socket = io.connect("http://localhost:4000");

    log = id("chat-log");
    input = id("chat-input");
    send = id("chat-send");
    send.addEventListener("click", sendMessage);
    input.addEventListener("keypress", (e) => {
        if (e.key == "Enter") {sendMessage();}
    });
    function sendMessage() {
        socket.emit("send_message", {message: input.value});
    }

    socket.on("receive_message", data => {
        addMessage(data.message, data.username, data.time);
    });
})();

function addMessage(message, user=username, time) {
    if (time == null) {
        const date = new Date();
        const hour = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        time = hour+":"+min;
    }

    const newMsg = log.el("div").class("message");
    newMsg.el("span").class("timestamp").text(time);
    newMsg.el("span").class("user").text(user)
        .el("span").text(":");
    newMsg.el("span").class("text").text(message);

    log.scrollTop = log.scrollHeight;
}