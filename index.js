const express = require('express');
const bodyParser = require('body-parser');
//const uuid = require('uuid');


const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
//const Genre = Models.Genre;
//const Director = Models.Director;

mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

                
//use of morgan for logging requests
app.use(morgan('common'));

//responses to url requests
app.get('/', (req, res) => {res.send('Welcome to my Movie club');
});



// Get all users(Read)
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get all movies(Read)
app.get('/movies', (req,res) => {Movies.find()
  .then((movies) =>{
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:  ' + err);
  });
});



// Get a user by their username(Read)
app.get('/users/:username', (req, res) => {
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
app.post('/users', (req, res) => {
    Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + 'This user already exists');
        } else {
          Users
            .create({
              username: req.body.username,
              password: req.body.password,
              email: req.body.email,
              birthday: req.body.birthday
            })
            .then((user) =>{res.status(201).json(user); 
            })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });


  
//Update a user by their username(Update)
app.put('/users/:username', (req, res) => {
  Users.findOneAndUpdate({ username: req.params.username }, { $set:
    {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      birthday: req.body.birthday
    }
  },
  { new: true }) 
  .then((updatedUser) => {
    if (!updatedUser) {
      return res.status(400).send('Error: This user does not exist');
    } else {res.json(updatedUser + 'This user\'s profile was updated');
    }
  })
  .catch((error) => {
    consol.error(error);
    res.status(500).send('Error: ' +  username  + ' user was not updated ' + error);
  });
});



// Delete a user by username(Delete)
app.delete('/users/:username', (req, res) => {
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
app.get('/movies/:Title', (req, res) => {
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
app.get('/movies/genres/:Genre', (req, res) => {
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
app.get('/movies/directors/:Director', (req, res) => {
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
app.get('/movies/actors/:Actors', (req, res) => {
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
app.get('/movies/director_name/:Director', (req,res) => {
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
app.get('/movies/genre_name/:Genre', (req,res) => {
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
app.post('/users/:username/movies/:movieID', (req, res) => {
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
app.delete('/users/:username/movies/:movieID', (req, res) => {
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


//Customer.findOneAndUpdate(query, {$pull: {address: addressId}}, (err, data) => {
  //if (err) {
    //  return res.status(500).json({ error: 'error in deleting address' });
  // }
  //res.json(data);   
//});

//documentation file from 'public' folder
app.use(express.static('public'));

//error handler for app
app.use((err,req,res,next) => {console.error(err.stack);
res.status(500).send('Something broke!');
})

app.listen(8080, () => {console.log('Your appis listening on port 8080.');
});
