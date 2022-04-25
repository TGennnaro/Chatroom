const { initializeApp } = require("firebase/app");
const { getDatabase, ref, child, get, set, onValue, off } = require("firebase/database");
const format = require("date-format");
const chat = require("./chat");

const firebaseConfig = {
    apiKey: "AIzaSyDaxgAFH8JAqiYgPpCD8Wm8bhLhM-MBchs",
    authDomain: "finalproject-8b860.firebaseapp.com",
    databaseURL: "https://finalproject-8b860-default-rtdb.firebaseio.com",
    projectId: "finalproject-8b860",
    storageBucket: "finalproject-8b860.appspot.com",
    messagingSenderId: "554579310933",
    appId: "1:554579310933:web:d69dd1473c004a542957dc",
};

let dbRef;

initialize = exports.initialize = function() {
    const firebase = initializeApp(firebaseConfig);
    const database = getDatabase(firebase);
    
    dbRef = ref(database);
}

attachListener = exports.attachListener = function(roomID, callback) {
    return new Promise((res, rej) => {
        const listener = child(dbRef, "/Chatrooms/"+roomID+"/messages");
        onValue(listener, (snapshot) => {
            callback(snapshot.val());
            res(listener);
        });
    });
}

detachListener = exports.detachListener = function(listener) {
    off(listener);
}

getEmail = exports.getEmail = function(username) {
    return new Promise((res, rej) => {
        get(child(dbRef, "/Users/"+username+"/email")).then((snapshot) => {
            if (snapshot.exists()) {
                res(snapshot.val());
            } else {
                rej("Invalid snapshot");
            }
        });
    });
}

registerUsername = exports.registerUsername = function(username, email) {
    return new Promise((res, rej) => {
        set(child(dbRef, "/Users/"+username), email).then(() => {
            console.log("User '"+username+"' registered successfully");
            res(username);
        })
        .catch((err) => {
            rej(err);
        });
    });
}

getRooms = exports.getRooms = function () {
    return new Promise((res, rej) => {
        get(child(dbRef, "/Chatrooms")).then(async (snapshot) => {
            if (snapshot.exists()) {
                const rooms = {};
                for (const [id, data] of Object.entries(snapshot.val())) {
                    rooms[id] = {
                        title: data.title,
                        creator: data.creator,
                        newestMsg: await loadRecentMessage(id, data.newestMsg)
                    };
                }
                res(rooms);
            } else {
                rej("Invalid snapshot");
            }
        });
    });
};

getRoom = exports.getRoom = function (roomID) {
    return new Promise((res, rej) => {
        get(child(dbRef, "/Chatrooms/" + roomID)).then((snapshot) => {
            if (snapshot.exists()) {
                const room = snapshot.val();
                room.messages = room.messages || [];
                res(room);
            } else {
                res(false);
            }
        }).catch((err) => {
            console.log(err);
        });
    });
};

getMessages = exports.getMessages = async function (roomID) {
    return (await getRoom(roomID)).messages;
};

loadRecentMessage = exports.loadRecentMessage = async function(roomID, messageID) {
    return new Promise((res, rej) => {
        get(child(dbRef, "/Chatrooms/"+roomID+"/messages/"+messageID)).then((snapshot) => {
            if (snapshot.exists()) {
                res(snapshot.val());
            } else {
                res(false);
            }
        }).catch((err) => {
            console.log(err);
        });
    });
}

registerMessage = exports.registerMessage = function(roomID, message, poster, posterUID) {
    return new Promise((res, rej) => {
        const date = new Date();
        const id = format.asString("MMddyyyyhhmmssSSS", date);
        set(child(dbRef, "/Chatrooms/"+roomID+"/messages/"+id), {
            message: message,
            poster: poster,
            posterUID: posterUID
        }).then(() => {
            set(child(dbRef, "/Chatrooms/"+roomID+"/newestMsg"), id).then(() => {
                res();
            });
        })
        .catch((err) => {
            rej(err);
        });
    });
}

// set(child(dbRef, "/Users/TGennaro"), {
//     name: "Tyler Gennaro",
//     dob: "04/06/2002"
// });
// get(child(dbRef, "/Chatrooms")).then(snapshot => {
//     if (snapshot.exists()) {
//         for (const [id, data] of Object.entries(snapshot.val())) {
//             console.log(data.privacy);
//         }
//     } else {
//         console.log("No data found");
//     }
// });
