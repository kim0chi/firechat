
  // constants
    const statusEl = document.getElementById("status");
    const messagesDiv = document.getElementById("messages");
    const messageInput = document.getElementById("messageInput");
    const authSection = document.getElementById("authSection");
    const userInfo = document.getElementById("userInfo");
    const userPhoto = document.getElementById("userPhoto");
    const userName = document.getElementById("userName");
    const chatSections = document.querySelectorAll(".chat-section");

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBw-aEwfWbr4pVfEvGyOBDs-EhOz4KfMiY",
  authDomain: "firechat-fb207.firebaseapp.com",
  databaseURL: "https://firechat-fb207-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "firechat-fb207",
  storageBucket: "firechat-fb207.firebasestorage.app",
  messagingSenderId: "393687049492",
  appId: "1:393687049492:web:6b978b652e49c69195ce01",
  measurementId: "G-80FPS7LJ2C"
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

        messages.sort((a, b) => a.timestamp - b.timestamp);
        messages.forEach(showMessage);
        
        // Auto-scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
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
        }).catch((error) => {
            // This will alert you if it's a permission issue
            console.error("Firebase Write Error:", error);
            alert("Failed to send: " + error.message);
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