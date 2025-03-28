// Initialize Firebase
function initializeFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyA76-3rhvUGEdRcblL16njg1-7Bgtnw",
        authDomain: "pulse-5a431.firebaseapp.com",
        databaseURL: "https://pulse-5a431-default-rtdb.firebaseio.com",
        projectId: "pulse-5a431",
        storageBucket: "pulse-5a431.appspot.com",
        messagingSenderId: "101121503468",
        appId: "1:101121503468:web:e451b3dfbf653fd9a489",
        measurementId: "G-313KEQNYV"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");

    // Return the database reference
    return firebase.database();
}