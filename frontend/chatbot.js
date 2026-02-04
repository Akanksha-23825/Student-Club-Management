document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  /**
   * Appends a message bubble to the chat window.
   * @param {string} sender - 'user' or 'bot'
   * @param {string} text - The message content
   */
function appendMessage(sender, text) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;
    
    // This regex globally removes all ** symbols for a professional look
    const cleanText = text.replace(/\*\*/g, "");
    
    messageDiv.innerText = cleanText; 
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // 1. Show the user's query immediately
    appendMessage("user", message);
    userInput.value = "";

    try {
      // 2. Fetch data from your Node.js backend
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();

      // 3. Display the formatted reply containing the contact info
      if (data.reply) {
        appendMessage("bot", data.reply);
      } else {
        appendMessage("bot", "I couldn't retrieve the club details.");
      }
    } catch (error) {
      console.error("❌ Chatbot Error:", error);
      appendMessage("bot", "Connection error. Please ensure your backend server is running.");
    }
  }

  // Event listeners for the Send button and Enter key
  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});