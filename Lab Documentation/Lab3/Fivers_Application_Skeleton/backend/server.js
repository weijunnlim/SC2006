//Express Backend
const express = require('express')

//To connect to Frontend
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


//routes
app.use('/api/authentication', authenticationRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/reservation', reservationRoutes)
app.use('/api/search',searchRoutes )
app.use('/api/profile', profileRoutes)

app.use('/api/migrate', migrateRoutes)


// listen for requests
app.listen(process.env.PORT, () => {
    console.log('listening on port 4000!')
})