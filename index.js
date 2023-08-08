const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');
const cors = require('cors');
const {check, validationResult} = require('express-validator');



const Movies = Models.Movie;
const Users = Models.User;
//const Genre = Models.Genre;
//const Director = Models.Director;

//mongoose.connect('mongodb://localhost:27017/cfDB', 
mongoose.connect( process.env.CONNECTION_URI,
{ 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});
//'mongodb+srv://gbsdpiano:guysflixDataBase@cluster0.9llraqg.mongodb.net/cfDB?retryWrites=true&w=majority'),
const app = express();

app.use(express.static('public'));
//app.use(express.json());
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cors());

let auth = require('./auth') (app);
const passport = require('passport');
require('./passport');

                
//responses to url requests
app.get('/', (req, res) => {res.send('Welcome to my Movie club');
});



// Get all users(Read)
//app.get('/users', (req, res) => {
  //Users.find()
    //.then((users) => {
      //res.status(201).json(users);
    //})
    //.catch((err) => {
      //console.error(err);
      //res.status(500).send('Error: ' + err);
    //});
//});

//Get all movies(Read) this retturns a list of all movies
app.get('/movies', (req,res) => {
  Movies.find()
  .then((movies) =>{
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:  ' + err);
  });
});



// Get a user by their username(Read)
app.get('/users/:username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOne({ username: req.params.username })
    .then((user) => {
      if (!user) {
        return res.status(400).send(req.body.username + ' This username ' + ' does not exist ');
      } else {res.status(201).json(user)
      };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//create a new user(Create)
  app.post('/users',
  [
    check('username', 'username is required').isLength({min: 5}),
    check('username', 'username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'password is required').not().isEmpty(),
    check('email', 'email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ username: req.body.username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.username + ' already exists');
        } else {
          Users
            .create({
              username: req.body.username,
              password: hashedPassword,
              email: req.body.email,
              birthday: req.body.birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });
  
//Update a user by their username(Update)
app.put('/users/:username', 
[
  check('username', 'username is required').isLength({min:5}),
  check('username', 'username contains non alphanumeric characters - not allowed.'
  ).isAlphanumeric(),
  check('password', 'password is required').not().isEmpty(),
  check('email', 'email does not appear to be valid').isEmail(),
],
  passport.authenticate('jwt', { 
  session: false }), (req, res) => {
    //checking validation
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array()});
    }
  const hashedPassword = Users.hashPassword(req.body.password);  
  Users.findOneAndUpdate(
    { username: req.params.username }, 
    {
  $set:
    {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      birthday: req.body.birthday
    }
  },
  { new: true }) 
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' +  username  + ' user was not updated ' + error);
  })
});


// Delete a user by username(Delete)
app.delete('/users/:username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndRemove({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(404).send(req.params.username + ' user was not found');
      } else {
        res.status(201).send(req.params.username + ' user was deleted.');
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});



//returning information on a specific movie by title(Read)
app.get('/movies/:Title', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne({Title: req.params.Title})
    .then((movie) => {
      if (!movie) {
        res.status(404).send(req.params.Title + ' , This movie was not found');
      } else {
      res.status(200).json(movie);}
    })
    .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});



//returning movies of a specific genre by genre name(Read)
app.get('/movies/genres/:Genre', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.find({'Genre.Name': req.params.Genre})
  .then((genre) => {
    if (!genre.length) {
    res.status(404).send(req.params.Genre + ' , This genre was not found');
    } else {
    res.status(200).json(genre);}
  })
    .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});



//returning movies by a specific director by director name(Read)
app.get('/movies/directors/:Director', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.find({'Director.Name': req.params.Director})
  .then((Director) => {
    if (!Director.length) {
      return res.status(404).send('Error ' + req.params.Director + ' , This Director was not found');
    } else {
      res.status(200).json(Director);}
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

//returning movies from the actors in a movie(Read)
app.get('/movies/actors/:Actors', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.find({Actors:req.params.Actors})
  .then((movie) => {
    if (!movie.length) {
      return res.status(404).send('Error: ' + req.params.Actors + ' , This Actor was not found')
    } else {
    res.status(200).json(movie);
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});


//returning information about a specific director(Read)
app.get('/movies/director_name/:Director', passport.authenticate('jwt', { session: false}), (req,res) => {
  Movies.findOne({'Director.Name': req.params.Director })
    .then((movie) => {
      if (!movie) {
          return res.status(404).send('Error: ' + req.params.Director + ' , This Director was not found');
      } else {
            res.status(200).json(movie.Director);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//returning information about a specific Genre(Read)
app.get('/movies/genre_name/:Genre', passport.authenticate('jwt', { session: false}), (req,res) => {
  Movies.findOne({'Genre.Name': req.params.Genre })
    .then((movie) => {
      if (!movie) {
          return res.status(404).send('Error: ' + req.params.Genre + ' , This Genre was not found');
      } else {
            res.status(200).json(movie.Genre);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// Add a movie to a user's list of favorites(create)
app.post('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ username: req.params.username }, {
     $push: { favoritemovies: req.params.movieID },
   },
   { new: true })
  .then((updatedUser) => {
    if (!updatedUser) {
          return res.status(404).send('Error: This user was not found');
    } else {
        res.json(updatedUser);
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
});


// Delete a movie from a user's list of favorites(delete)
app.delete('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false}),
 (req, res) => {
  Users.findOneAndUpdate(
    { username: req.params.username }, 
    {
     $pull: { favoritemovies: req.params.movieID },
   },
   { new: true })
   .then((updatedUser) => {
    if (!updatedUser) {
          return res.status(404).send('Error: This user was not found');
    } else {
        res.json(updatedUser);
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
});



//documentation file from 'public' folder
app.use(express.static('public'));

//error handler for app
app.use((err,req,res,next) => {console.error(err.stack);
res.status(500).send('Something broke!');
});


//const port = process.env.PORT || 8080;
//app.listen(8080, () => {console.log('Your appis listening on port 8080.');
//});
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
