document.addEventListener("DOMContentLoaded", function () {
    // ✅ Define API URL
    const API_URL = window.location.hostname.includes("localhost")
        ? "http://localhost:5000/api/chat"
        : "https://nocai-1.onrender.com/api/chat";

    // Select UI elements
    const scanScreen = document.getElementById("scan-screen");
    const scanText = document.getElementById("scan-text");
    const scanAnimation = document.getElementById("scan-animation");
    const accessScreen = document.getElementById("access-screen");
    const introScreen = document.getElementById("intro-screen");
    const chatbotContainer = document.getElementById("chatbot-container");
    const inputField = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-button");
    const stopSpeakButton = document.getElementById("stop-speak-button");
    const chatBox = document.getElementById("chat-box");
    const copyButton = document.getElementById("copyButton"); // For copy functionality
    const threejsContainer = document.getElementById("threejs-container");

    let isSpeechAllowed = false;

    // ✅ Fix: Enable Speech on User Interaction (Mandatory for Mobile Browsers)
    function enableSpeech() {
        if (!isSpeechAllowed) {
            let init = new SpeechSynthesisUtterance("");
            speechSynthesis.speak(init);
            isSpeechAllowed = true;
            console.log("🔊 Speech enabled on mobile");
        }
    }

    document.addEventListener("click", enableSpeech);
    document.addEventListener("touchstart", enableSpeech); // iOS Fix

    // ✅ Fingerprint Scanner Click Event
    scanScreen.addEventListener("click", function () {
        console.log("🔹 Fake scanner clicked – granting access...");

        scanText.innerHTML = "SCANNING...";
        scanAnimation.classList.add("scanning"); // Add scanning class for cyberpunk animation

        setTimeout(() => {
            scanText.innerHTML = "ACCESS GRANTED ✅";
            scanAnimation.classList.remove("scanning"); // Remove scanning class to stop animation

            setTimeout(() => {
                scanScreen.style.display = "none";
                accessScreen.style.display = "flex";
            }, 1000);

            setTimeout(() => {
                accessScreen.style.display = "none";
                introScreen.style.display = "flex";
            }, 2500);

            setTimeout(() => {
                introScreen.style.display = "none";
                chatbotContainer.style.display = "block";
                chatbotContainer.style.opacity = "1";
                console.log("✅ Chatbot is now visible");
            }, 4000);
        }, 3000);
    });

    // ✅ Function to Speak (Text-to-Speech) with Female Voice
    function speak(text) {
        if (!isSpeechAllowed || !text) return; // Prevent autoplay block

        let speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 1.0;
        speech.pitch = 0.8; // More robotic tone (adjustable)
        speech.volume = 1.0;

        // Function to set female voice
        function setFemaleVoice() {
            const voices = speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => 
                voice.lang === "en-US" && (
                    voice.name.toLowerCase().includes("female") ||
                    voice.name.includes("Google US English") || // Often female-sounding
                    voice.name.includes("Samantha") || // macOS female voice
                    voice.name.includes("Victoria") || // Common female voice
                    voice.name.includes("Zira")        // Windows female voice
                )
            );

            if (femaleVoice) {
                speech.voice = femaleVoice;
                console.log("🔊 Using female voice:", femaleVoice.name);
            } else {
                console.log("🔊 No female voice found, using default");
            }

            // Speak with a slight delay to ensure voice is set
            setTimeout(() => {
                speechSynthesis.speak(speech);
            }, 500); // Small delay fixes mobile issues
        }

        // Check if voices are already loaded; if not, wait for them
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = setFemaleVoice;
        } else {
            setFemaleVoice();
        }
    }

    // ✅ Function to Send Messages
    async function sendMessage() {
        const userInput = inputField.value.trim();
        if (!userInput) return;

        // Display user message
        appendMessage("You: " + userInput, "user-text");

        // Show bot "Analyzing..." text
        let botMessage = appendMessage("Analyzing...", "bot-text");

        chatBox.scrollTop = chatBox.scrollHeight;
        inputField.value = "";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userInput })
            });

            if (!response.ok) throw new Error("Server error");

            const data = await response.json();
            chatBox.removeChild(botMessage);

            if (data.image_url) {
                // ✅ Display Image if the bot generates one
                appendMessage("Here is your generated image:", "bot-text");
                let imageElement = document.createElement("img");
                imageElement.src = data.image_url;
                imageElement.classList.add("generated-image");
                chatBox.appendChild(imageElement);
            } else {
                let botReply = data.response;
                appendMessage(botReply, "bot-text");
                speak(botReply); // ✅ Speak the bot's response with female voice
            }

        } catch (error) {
            console.error("Error fetching response:", error);
            botMessage.textContent = "Nocturnal: Error fetching response!";
        }
    }

    // ✅ Function to Append Messages with Blinking Effect for AI
    function appendMessage(text, className) {
        const messageElement = document.createElement("p");
        messageElement.classList.add(className);

        // ✅ Apply blinking effect ONLY to AI responses
        if (className === "bot-text") {
            messageElement.classList.add("blinking-text");
        }

        messageElement.textContent = text;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to latest message

        return messageElement;
    }

    // ✅ Stop Speaking Button
    stopSpeakButton.addEventListener("click", function () {
        speechSynthesis.cancel();
        console.log("🛑 Speech stopped by user");
    });

    // ✅ Event Listeners for Sending Messages
    inputField.addEventListener("keypress", function (event) {
        if (event.key === "Enter") sendMessage();
    });

    sendButton.addEventListener("click", sendMessage);

    // ✅ Copy Button Functionality
    if (copyButton) {
        copyButton.addEventListener('click', function() {
            const contractText = document.getElementById('contractText').textContent;
            navigator.clipboard.writeText(contractText).then(() => {
                console.log("Contract address copied to clipboard!");
                alert("Contract address copied to clipboard!"); // Optional feedback
            }).catch(err => {
                console.error("Failed to copy text: ", err);
                alert("Failed to copy contract address. Please try again."); // Optional error feedback
            });
        });
    }

    // ✅ Track mouse movement for custom cursor, ensuring visibility during scroll
    let cursorVisible = true;
    const cursor = document.getElementById('cyberpunk-cursor');
    if (cursor) {
        // Ensure cursor starts visible
        cursor.style.display = 'block';
        cursor.style.visibility = 'visible';

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.pageX + 'px';
            cursor.style.top = e.pageY + 'px';
            cursor.style.display = 'block';
            cursor.style.visibility = 'visible';
            cursor.style.zIndex = '10000';
            cursorVisible = true;
            console.log("Cursor moved to: ", e.pageX, e.pageY);
        });

        // Hide cursor when mouse leaves the window, but ensure it reappears on re-entry
        document.addEventListener('mouseleave', () => {
            cursor.style.display = 'none';
            cursorVisible = false;
        });

        document.addEventListener('mouseenter', () => {
            if (cursorVisible) {
                cursor.style.display = 'block';
                cursor.style.visibility = 'visible';
                cursor.style.zIndex = '10000';
            }
        });

        // Ensure cursor remains visible during scroll, with robust handling
        window.addEventListener('scroll', (event) => {
            if (cursorVisible) {
                const scrollY = window.scrollY || document.documentElement.scrollTop;
                const scrollX = window.scrollX || document.documentElement.scrollLeft;
                cursor.style.top = (event.pageY + scrollY) + 'px';
                cursor.style.left = (event.pageX + scrollX) + 'px';
                cursor.style.display = 'block';
                cursor.style.visibility = 'visible';
                cursor.style.zIndex = '10000'; // Force cursor above all
                console.log("Cursor scrolled to: ", cursor.style.left, cursor.style.top);
            }
        });
    }

    // ✅ 3D Particle Streaming Effect with Three.js (Enhanced for reliability)
    try {
        if (threejsContainer && THREE) {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000, 0); // Transparent background
            threejsContainer.appendChild(renderer.domElement);

            // Particle system
            const particlesGeometry = new THREE.BufferGeometry();
            const particleCount = 1000; // Number of particles
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount * 3; i += 3) {
                // Random positions in a cube (-50 to 50 on X, Y, Z)
                positions[i] = (Math.random() - 0.5) * 100; // X
                positions[i + 1] = (Math.random() - 0.5) * 100; // Y
                positions[i + 2] = (Math.random() - 0.5) * 100; // Z

                // Random colors: neon green (#00ff00) or pink (#ff00ff)
                const color = Math.random() > 0.5 ? new THREE.Color(0x00ff00) : new THREE.Color(0xff00ff);
                colors[i] = color.r;
                colors[i + 1] = color.g;
                colors[i + 2] = color.b;
            }

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending // Glowing effect
            });

            const particles = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particles);

            camera.position.z = 100;

            // Animate particles to stream (move towards camera)
            function animate() {
                requestAnimationFrame(animate);

                // Update particle positions to create streaming effect
                const positions = particlesGeometry.attributes.position.array;
                for (let i = 0; i < particleCount * 3; i += 3) {
                    positions[i + 1] -= 0.5; // Move downwards (Y-axis)
                    if (positions[i + 1] < -50) {
                        positions[i + 1] = 50; // Reset to top when below -50
                        positions[i] = (Math.random() - 0.5) * 100; // Random X
                        positions[i + 2] = (Math.random() - 0.5) * 100; // Random Z
                    }
                }
                particlesGeometry.attributes.position.needsUpdate = true;

                // Rotate scene slightly for 3D effect
                particles.rotation.x += 0.001;
                particles.rotation.y += 0.001;

                renderer.render(scene, camera);
            }

            animate();

            // Handle window resize
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            console.log("3D particle effect initialized successfully.");
        } else {
            console.error("Three.js or threejsContainer not found.");
        }
    } catch (error) {
        console.error("Error initializing 3D particle effect:", error);
    }
});