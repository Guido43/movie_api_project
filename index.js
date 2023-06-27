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
app.get('/movies', (req, res) => {res.json(topMovies);
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
