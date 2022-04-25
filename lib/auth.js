const LocalStrategy = require("passport-local").Strategy;
const {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} = require("firebase/auth");
const dbManager = require("./dbManager");

const auth = getAuth();

initialize = exports.initialize = (passport) => {

    const authenticateUser = exports.authenticateUser = async (username, password, done) => {
        const email = await dbManager.getEmail(username);
        signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
            const user = userCredential.user;
            done(null, {
                id: user.uid,
                username: username,
                email: user.email
            });
        })
        .catch((err) => {
            done(err);
        })
    }
    
    passport.use("local-login", new LocalStrategy({usernameField:"username", passwordField:"password"}, authenticateUser));
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
}

registerUser = exports.registerUser = function(req, res, next) {
    createUserWithEmailAndPassword(auth, req.body.email, req.body.password).then((userCredential) => {
        const user = userCredential.user;
        dbManager.registerUsername(req.body.username, user.email).then(username => {
            next();
        });
    })
    .catch((err) => {
        console.log(err);
    });
}

checkAuthenticated = exports.checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/chat/login");
}

checkNotAuthenticated = exports.checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/chat");
    }
    next();
}