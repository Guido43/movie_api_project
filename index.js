const express = require('express'),
morgan = require('morgan');
const app = express();

let topMovies = [{title: 'The lord of the rings', director: 'Peter Jackson'},
                {title: 'reservoir dogs', director: 'Quentin Tarantino' },
                {title: 'Fight-Club', director: 'David Fincher'},
                {title: 'The Misson', director: 'Roland Joffé'},
                {title: 'The Truman Show', director: 'Peter Weir'},
                {title: 'Amadeus', director: 'Milos Forman'},
                {title: 'Beetlejuice', diector: 'Tim Burton'},
                {title: 'The Godfather part 2', director: 'Francis Ford Copella'},
                {title: 'Robin Hood prince of thieves', director: 'Kevin Reynolds'},
                {title: 'The Mask', director: 'Charles Russell'} ]

                
//use of morgan for logging requests
app.use(morgan('common'));

//responses to url requests
app.get('/', (req, res) => {res.send('Welcome to my Movie club');
});
app.get('/movies', (req, res) => {
    res.json(topMovies);
  });
app.get('/movies/film_info', (req, res) => {
    res.send('Successful GET request returning data on movie descriptions and other details of the movie');
  });  
app.get('/movies/genres', (req, res) => {
    res.send('Succeessful GET request returning data on movie genres');
  });
app.get('/movies/directors', (req, res) => {
    res.send('Successful GET request returning data on individual directors of the movies');
  });
app.post('/movies/users', (req, res) => {
    res.send('Allows inputting of data to create user account');
  });
app.put('/movies/username', (req, res) => {
    res.send('Allows users to update their account information');
  });
app.post('/movies/add_movie', (req, res) => {
    res.send('Allows users to add a movie of their choice to the list');
  });
app.delete('/movies/remove_movie', (req, res) => {
    res.send('Allows users to remove a movie from their list');
  });
app.delete('/movies/remove_user', (req, res) => {
    res.send('Allows existing users to unregister and remove their account');
  });

//documentation file from 'public' folder
app.use(express.static('public'));

//error handler for app
app.use((err,req,res,next) => {console.error(err.stack);
res.status(500).send('Something broke!');
})

//listening port
app.listen(8080, () => {console.log('Your appis listening on port 8080.');
});
