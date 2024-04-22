// https://www.youtube.com/watch?v=LefcqnZHYeg based on this

const { initializeApp, cert } = require("firebase-admin/app")
const { getFirestore} = require('firebase-admin/firestore')
const { getAuth} = require('firebase-admin/auth')

const serviceAccount = require('./creds.json')

//this is based for firebase-admin
initializeApp({
    credential: cert(serviceAccount)
})


var db = getFirestore()
const auth = getAuth()
db.settings({timestampsInSnapshots: true })

module.exports = { db, auth }
