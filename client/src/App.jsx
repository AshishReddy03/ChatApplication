import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const socket = io("https://chatapplication-blcj.onrender.com/");

function App() {
  const [clientsTotal, setClientsTotal] = useState(0);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [screen, setScreen] = useState("landing"); // landing | login | chat
  const messageContainerRef = useRef(null);

  useEffect(() => {
    socket.on("clients-total", setClientsTotal);
    socket.on("chat-message", (data) => addMessage(data, false));
    socket.on("feedback", (data) => setFeedback(data.feedback));
    return () => {
      socket.off("clients-total");
      socket.off("chat-message");
      socket.off("feedback");
    };
  }, []);

  const addMessage = (data, isOwn) => {
    setFeedback("");
    setMessages((prev) => [...prev, { ...data, isOwn }]);
    setTimeout(() => {
      messageContainerRef.current?.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const data = {
      name,
      message,
      dateTime: new Date(),
    };
    socket.emit("message", data);
    addMessage(data, true);
    setMessage("");
  };

  let typingTimer;
  const handleTyping = () => {
    socket.emit("feedback", { feedback: `✍️ ${name} is typing...` });
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      socket.emit("feedback", { feedback: "" });
    }, 1000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setScreen("chat");
  };

  // Landing Screen
  if (screen === "landing") {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 px-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-blue-700 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Welcome to Real-Time Chat 💬
        </motion.h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Experience live messaging with instant feedback and smooth animations.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setScreen("login")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow-md font-medium"
        >
          Join Now
        </motion.button>
      </motion.div>
    );
  }

  // Login Screen
  if (screen === "login") {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-2xl shadow-xl w-80 text-center space-y-4 border border-blue-100"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h1 className="text-2xl font-bold text-blue-700">Join the Chat</h1>
          <p className="text-sm text-gray-500">
            Enter your name to get started
          </p>
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded shadow"
          >
            Enter Chat
          </motion.button>
        </motion.form>
      </motion.div>
    );
  }

  // Chat Screen
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 border border-blue-300"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80 }}
      >
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-700">
          💬 Realtime Chat
        </h2>
        <div className="text-right text-sm text-gray-500 mb-2">
          Connected Clients:{" "}
          <span className="font-semibold text-blue-600">{clientsTotal}</span>
        </div>

        <div
          ref={messageContainerRef}
          className="h-80 overflow-y-auto bg-blue-50 rounded p-3 mb-4 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`mb-3 flex ${
                  msg.isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-xl px-4 py-2 text-sm shadow-md max-w-xs ${
                    msg.isOwn
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{msg.message}</p>
                  <div className="text-[10px] mt-1 text-right opacity-70">
                    {msg.name} • {moment(msg.dateTime).fromNow()}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {feedback && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm italic text-blue-500 mt-1"
            >
              {feedback}
            </motion.p>
          )}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 items-center">
          <motion.input
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onInput={handleTyping}
            whileFocus={{ scale: 1.01 }}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            Send
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default App;
