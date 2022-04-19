const chatLog = [
    {
        time: "12:16",
        user: "TGennaro",
        message: "Test number 1"
    },
    {
        time: "12:17",
        user: "NKowalski112",
        message: "Another test"
    },
    {
        time: "12:18",
        user: "JohnP77",
        message: "This is getting repetitive"
    },
    {
        time: "12:20",
        user: "LB22",
        message: "Original message"
    },
];

function getChatLog() {
    return chatLog;
}

function pushMessage(data) {
    chatLog.push(data);
}

function formatMessageTime(time) {
    const hour = time.substring(8, 10);
    const minute = time.substring(10, 12);
    return hour+":"+minute;
}

module.exports = {
    getChatLog,
    pushMessage,
    formatMessageTime
}