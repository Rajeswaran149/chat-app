const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const socket = require("socket.io");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: "*", // Update with your frontend URL in production
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended : true }));

// Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("DB Connection Successful");
})
.catch((err) => {
  console.error("DB Connection Error:", err);
  process.exit(1); // Exit the process if DB connection fails
});

// Socket.IO Setup
const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: '*', // Update with your frontend URL in production
    credentials: true,
  },
});

// Socket.IO Event Handlers
global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
