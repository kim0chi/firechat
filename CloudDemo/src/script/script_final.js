
  // constants
    const statusEl = document.getElementById("status");
    const messagesDiv = document.getElementById("messages");
    const messageInput = document.getElementById("messageInput");
    const authSection = document.getElementById("authSection");
    const userInfo = document.getElementById("userInfo");
    const userPhoto = document.getElementById("userPhoto");
    const userName = document.getElementById("userName");
    const chatSections = document.querySelectorAll(".chat-section");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

    // Firebase Config
    const firebaseConfig = {
        apiKey: "AIzaSyDmYXQz7Y5C2SjcoO6YDsbwn_qPny9u72U",
        authDomain: "fir-demo-d813b.firebaseapp.com",
        databaseURL: "https://fir-demo-d813b-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "fir-demo-d813b",
        storageBucket: "fir-demo-d813b.firebasestorage.app",
        messagingSenderId: "79516643962",
        appId: "1:79516643962:web:a6585178549a72d090c1c3",
        measurementId: "G-H21BXY5RT4"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const messagesRef = ref(db, "messages");

    let currentUser = null;

    statusEl.className = "status connected";
    statusEl.textContent = "Connected to Firebase Cloud";

    // Google Sign In
    window.signInWithGoogle = async function() {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            alert("Sign in failed: " + error.message);
        }
    };

    // Sign Out
    window.signOutUser = async function() {
        try {
            await signOut(auth);
        } catch (error) {
            alert("Sign out failed: " + error.message);
        }
    };

    // Auth State Listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            authSection.style.display = "none";
            userInfo.style.display = "flex";
            chatSections.forEach(section => section.classList.add("active"));
            
            userPhoto.src = user.photoURL || "";
            userName.textContent = user.displayName || user.email;
        } else {
            currentUser = null;
            authSection.style.display = "block";
            userInfo.style.display = "none";
            chatSections.forEach(section => section.classList.remove("active"));
        }
    });


    // Display message
    function showMessage(msg) {
        var div = document.createElement("div");
        var time = new Date(msg.timestamp).toLocaleTimeString();
        div.innerHTML = "[" + time + "] <strong>" + msg.name + "</strong>: " + msg.text;
        messagesDiv.appendChild(div);
    }

    // Real-time listener
    onValue(messagesRef, (snapshot) => {

        messagesDiv.innerHTML = "";

        // If there are no messages yet
        if (!snapshot.exists()) {
            messagesDiv.innerHTML = "<div class='empty-state'>No messages yet.</div>";
            return;
        }

        const data = snapshot.val();
        const messages = [];

        for (let id in data) {
            messages.push({
                id: id,
                name: data[id].name,
                text: data[id].text,
                timestamp: data[id].timestamp
            });
        }

        messages.sort((a, b) => b.timestamp - a.timestamp);
        messages.forEach(showMessage);
    });


    // Send message
    window.sendMessage = function() {
        if (!currentUser) {
            alert("Please sign in first");
            return;
        }

        var text = messageInput.value.trim();

        if (!text) {
            alert("Enter a message");
            return;
        }

        push(messagesRef, {
            name: currentUser.displayName || currentUser.email,
            text: text,
            timestamp: Date.now(),
            userId: currentUser.uid
        });

        messageInput.value = "";
    };

    // Delete message
    window.deleteMessage = function(id) {
        remove(ref(db, "messages/" + id));
    };

    // Clear messages
    window.clearMessages = function() {
        if (confirm("Clear all messages?")) {
            remove(messagesRef);
        }
    };

    // Press enter to send
    messageInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            window.sendMessage();
        }
    });