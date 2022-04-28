function formatMessageTime(time) {
    const hour = time.substring(8, 10);
    const minute = time.substring(10, 12);
    return hour+":"+minute;
}

function timeFromMessage(time) {
    if (time == null) {
        return "";
    }

    const date1 = new Date();

    const month = parseInt(time.substring(0, 2))-1;
    const day = parseInt(time.substring(2, 4));
    const year = parseInt(time.substring(4, 8));
    const hour = parseInt(time.substring(8, 10));
    const minute = parseInt(time.substring(10, 12));
    const second = parseInt(time.substring(12, 14));
    const milli = parseInt(time.substring(14, 17));

    const date2 = new Date(year, month, day, hour, minute, second, milli);
    const diff = Math.floor(Math.abs(date1-date2)/1000);

    let currentTime = diff;
    let currentUnits = "sec";

    if (diff/60 > 1) {
        currentTime = Math.floor(currentTime/60);
        currentUnits = "min";
    }
    if (diff/60/60 > 1) {
        currentTime = Math.floor(currentTime/60);
        currentUnits = "hr";
    }
    if (diff/60/60/24 > 1) {
        currentTime = Math.floor(currentTime/24);
        currentUnits = "dy";
    }

    return currentTime+" "+currentUnits;
}

module.exports = {
    formatMessageTime,
    timeFromMessage
}