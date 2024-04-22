require('dotenv').config() //For Security reasons

const express = require('express')
const cors = require('cors');

const authenticationRoutes = require('./routes/authentication')
const reviewRoutes = require('./routes/review')
const reservationRoutes = require('./routes/reservation')
const searchRoutes = require('./routes/search')
const profileRoutes = require('./routes/profile')
const favouriteRoutes = require('./routes/favourites')

// express app
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true // if you need to send cookies or authorization headers
  }));

//middleware, used for logging
app.use(express.json())

app.use((req,res, next)=> {
    console.log(req.path, req.method)
    next()
})

/*
app.get('/', (req,res) => {
    console.log("test")
})
*/

//routes
app.use('/api/authentication', authenticationRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/reservation', reservationRoutes)
app.use('/api/search',searchRoutes )
app.use('/api/profile', profileRoutes)
app.use('/api/favourites', favouriteRoutes)


// listen for requests
app.listen(process.env.PORT, () => {
    console.log('listening on port 4000!')
})
