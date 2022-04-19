(function init() {
    socket = io.connect("http://localhost:4000");

    const usernameInput = id("username");
    const emailInput = id("email");
    const passwordInput = id("password");

    const login = id("login");
    const register = id("register");

    if (login != null) {
        login.addEventListener("click", function() {
            if (usernameInput.value != "" && passwordInput != "") {
                socket.emit("login", {username: usernameInput.value, password: passwordInput.value});
            }
        });
    }
    if (register != null) {
        register.addEventListener("click", function() {
            if (emailInput.value != "" && usernameInput.value != "" && passwordInput != "") {
                socket.emit("register", {email: emailInput.value, username: usernameInput.value, password: passwordInput.value});
            }
        });
    }

    socket.on("receive_message", data => {
        addMessage(data.message, data.username, data.time);
    });
})();