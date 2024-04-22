  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyC63MK5LBwhRh_thgCtbduKDpscuBbSITo",
    authDomain: "fivers-14d26.firebaseapp.com",
    projectId: "fivers-14d26",
    storageBucket: "fivers-14d26.appspot.com",
    messagingSenderId: "604487933420",
    appId: "1:604487933420:web:63972e797c7ce06302b4c9"
};

firebase.initializeApp(config);
            const auth = firebase.auth();
            var db = firebase.firestore();
            //const database =firebase.database(); //real time database
            db.settings({ timestampsInSnapshots: true }); 

            // Get a reference to the Firebase authentication service
          //  const auth = firebase.auth();

            // Get a reference to the Firebase Realtime Database service
            //const database = firebase.database();
