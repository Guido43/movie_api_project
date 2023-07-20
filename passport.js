const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

//passport.use(new LocalStrategy({
  //usernameField: 'Username',
  //passwordField: 'Password'
//}, (username, password, callback) => {
  //console.log(username + '  ' + password);
  //Users.findOne({ Username: username }, (error, user) => {
    //if (error) {
      //console.log(error);
      //return callback(error);
    //}

    //if (!user) {
      //console.log('incorrect username');
      //return callback(null, false, {message: 'Incorrect username or password.'});
    //}

    //console.log('finished');
    //return callback(null, user);
  //});
//}));

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, (username, password, callback) => {
  console.log(username + '  ' + password);
  Users.findOne({ username: username })
    .then(user => {
      if (!user) {
        console.log('incorrect username');
        return callback(null, false, { message: 'Incorrect username or password.' });
      }

      //if (!user.validatePassword(password)) {
        //console.log('incorrect password');
        //return callback(null, false, { message: 'Incorrect password.' });
      //}

      console.log('finished');
      return callback(null, user);
    })
    .catch(error => {
      console.log(error);
      return callback(error);
    });
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
  }, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
      .then((user) => {
        return callback(null, user);
      })
      .catch((error) => {
        return callback(error)
      });
  }));

