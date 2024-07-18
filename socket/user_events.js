const io = require("../server");

io.on("connection", (socket) => {
  // Join a private room to allow for private messaging.
  const userId = socket.handshake.query.userId;
  socket.join(userId);

  console.log(`${userId} connected`);

  socket.on("send message", ({ friend_id, message }) => {
    // Broadcast it back to the specific friend.
    io.to(friend_id).emit("chat message", message);
  });
});
