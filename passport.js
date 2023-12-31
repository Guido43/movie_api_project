const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;


passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    (username, password, callback) => {
      console.log(username + ' ' + password);
      
      Users.findOne({ Username: username })
      .then((user) => {
        if (!user) {
          console.log('incorrect Username');
          return callback(null, false, { message: 'Incorrect Username or Password.' 
        });
        }

        if (!user.validatePassword(password)) {
          console.log('incorrect password');
          return callback(null, false, { message: 'incorrect Username or Password.'
        })
        }
        console.log('finished');
        return callback(null, user);
      })
      .catch((error) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
      })
    }
  )
);

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'thisismysecretkey'
  }, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
      .then((user) => {
        return callback(null, user);
      })
      .catch((error) => {
        return callback(error)
      });
  }));

