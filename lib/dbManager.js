const { initializeApp } = require("firebase/app");
const { getDatabase, ref, child, get, set, onValue } = require("firebase/database");
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

attachListeners = function() {
    onValue(child(dbRef, "/Chatrooms"), (snapshot) => {
        const data = snapshot.val();
    });
}

getEmail = exports.getEmail = function(username) {
    return new Promise((res, rej) => {
        get(child(dbRef, "/Users/"+username)).then((snapshot) => {
            if (snapshot.exists()) {
                res(snapshot.val());
            } else {
                rej("Invalid snapshot");
            }
        });
    });
}

registerUsername = exports.registerUsername = function(username, email) {
    set(child(dbRef, "/Users/"+username), email).then(() => {
        console.log("User '"+username+"' registered successfully");
    })
    .catch((err) => {
        console.log(err);
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
                res(snapshot.val());
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
