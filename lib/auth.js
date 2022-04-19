const LocalStrategy = require("passport-local").Strategy;
const {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} = require("firebase/auth");
const dbManager = require("./dbManager");

const auth = getAuth();

initialize = exports.initialize = (passport) => {
    const authenticateUser = async (email, password, done, useEmail) => {
        /*
            Authenticate username
        */

        if (!useEmail) {
            email = await dbManager.getEmail(email);
        }
        signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
            const user = userCredential.user;
            done(null, user);
        })
        .catch((err) => {
            done(err);
        })
        // con.query("SELECT * FROM `users` WHERE email = ?", [email], async (err, rows) => {
        //     if (err) throw err;
        //     if (rows.length == 0){
        //         return done(null, false, {message:"Email is not registered"});
        //     }

        //     /*
        //         Authenticate password
        //     */

        //     try {
        //         if (await bcrypt.compare(password, rows[0].password)){
        //             return done(null, rows[0]); // Return the user after authentication
        //         } else {
        //             return done(null, false, {message:"Password incorrect"});
        //         }
        //     } catch (e) {
        //         return done(e);
        //     }
        // })
    }

    const registerUser = (email, password, done) => {

        createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
            const user = userCredential.user;
            authenticateUser(email, password, done, true);
        })
        .catch((err) => {
            done(err);
        });

        // con.query("SELECT * FROM `users` WHERE email = ?", [email], async (err, rows) => {
        //     if (err) {
        //         throw err;
        //     }
        //     /*
        //         Check if username is taken
        //     */
        //     if (rows.length){
        //         return done(null, false, {message: "That email is already registered."});
        //     } else {
        //         /*
        //             Handle SQL insertion
        //         */
        //         try{
        //             const hashedPassword = await bcrypt.hash(password, 10);
        //             con.query("INSERT INTO `users` SET ?", {email: email, password: hashedPassword}, (err2, res) => {
        //                 if (err2){
        //                     return console.log(err2);
        //                 }
        //                 authenticateUser(email, password, done);
        //                 //return done(null, rows[0]); // Return the user
        //             });
        //         } catch {
        //             return done(null, false, {message: "There was a critical error. Try again later."});
        //         }
        //     }
        // });
    }

    passport.use("local-login", new LocalStrategy({usernameField:"username", passwordField:"password"}, authenticateUser));
    passport.use("local-register", new LocalStrategy({usernameField:"email", passwordField:"password"}, registerUser));
    passport.serializeUser((user, done) => done(null, user.uid));
    passport.deserializeUser((uid, done) => {
        done(null, auth.currentUser);
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