let log;
let input;
let send;

(function init() {
    log = id("chat-log");
    input = id("message-input");
    send = id("message-send");
    if (send && input) {
        send.addEventListener("click", sendMessage);
        input.addEventListener("keypress", (e) => {
            if (e.key == "Enter") {sendMessage();}
        });
    }

    function sendMessage() {
        socket.emit("send_message", {message: input.value});
        input.value = "";
    }

    socket.on("receive_username", data => {
        socket.username = data.username;
    })

    socket.on("receive_message", data => {
        addMessage(data.id, data.message, data.username, data.time, data.username == socket.username);
    });
})();

function addMessage(id, message, username, time, self) {
    if (time == null) {
        const date = new Date();
        const hour = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        time = hour+":"+min;
    }

    const msg = log.el("div").class("message");
    msg.id = id;
    const content = msg.el("div").class(self ? "message-self" : "message-other");
    content.el("span").class("message-username").text(username);
    content.el("div").class("message-content").text(message);

    log.scrollTop = log.scrollHeight;
}

window.addEventListener("load", () => {
    log.scrollTop = log.scrollHeight;
});