const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');
const cors = require('cors');
const {check, validationResult} = require('express-validator');
const fs = require('fs');


//mongoose.connect('mongodb://localhost:27017/cfDB', 
mongoose.connect(process.env.CONNECTION_URI,
{ 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 

});
//'mongodb connection to mongoose schema
const app = express(),
      Movies = Models.Movie,
      Users = Models.User;

app.use(express.static('public'));


//body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

let allowedOrigins = ['http://localhost:8080','https://guysflix.netlify.app','http://localhost:8080'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

//Authentification and login endpoint
let auth = require('./auth') (app);
const passport = require('passport');
require('./passport');

//logging 
app.use(morgan('common'));

                
//responses to url requests

//Home
app.get('/', (req, res) => {res.send('Welcome to my Movie club');
});



//Get all movies(Read) this retturns a list of all movies
app.get('/movies', passport.authenticate('jwt', { session: false}),
(req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
})
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:  ' + err);
  });
});

//Get all users(Read) this retturns a list of all users
app.get('/users', (req, res) => {
  Users.find()
  .then((movies) => {
    res.status(201).json(movies);
})
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:  ' + err);
  });
});





// Get a user by their username(Read)
app.get('/users/:Username', 
passport.authenticate('jwt', { session: false}),(req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        return res.status(400).send(req.body.Username + ' This username ' + ' does not exist ');
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
   check('Username', 'Username is required').isLength({min: 5}),
   check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
   check('Password', 'Password is required').not().isEmpty(),
   check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
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
app.put('/users/:Username',
[
  check('Username', 'Username is required').isLength({min:5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.'
  ).isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail(),
], 
passport.authenticate('jwt', { session: false}),
(req, res) => {
    //checking validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array()});
    }
  const hashedPassword = Users.hashPassword(req.body.Password);  
  Users.findOneAndUpdate({ Username: req.params.Username }, 
    {
  $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) 
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + ' user was not updated ');
  })
});


// Delete a user by username(Delete)
app.delete('/users/:Username', 
passport.authenticate('jwt', { session: false}),(req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(404).send(req.params.Username + ' user was not found');
      } else {
        res.status(201).send(req.params.Username + ' user was deleted.');
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});



//returning information on a specific movie by title(Read)
app.get('/movies/:Title', 
passport.authenticate('jwt', { session: false}),(req, res) => {
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
app.get('/movies/genres/:Genre', 
passport.authenticate('jwt', { session: false}), (req, res) => {
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
app.get('/movies/directors/:Director',
passport.authenticate('jwt', { session: false}), (req, res) => {
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
app.get('/movies/actors/:Actors', 
passport.authenticate('jwt', { session: false}), (req, res) => {
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
app.get('/movies/director_name/:Director', 
passport.authenticate('jwt', { session: false}), (req,res) => {
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
app.get('/movies/genre_name/:Genre', 
passport.authenticate('jwt', { session: false}), (req,res) => {
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
app.post('/users/:Username/movies/:movieID', 
passport.authenticate('jwt', { session: false}),(req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
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
app.delete('/users/:Username/movies/:movieID', 
passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username }, 
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
