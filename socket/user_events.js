const io = require("../server");

io.on("connection", (socket) => {
  // Join a private room to allow for private messaging.
  const userId = socket.handshake.query.userId;
  socket.join(userId);

  console.log(`${userId} connected`);

  socket.on("send message", ({ user_id, friend_id, message }) => {
    // Broadcast it back to the specific friend.
    io.to(friend_id).emit("chat message", user_id, message);
    io.to(friend_id).emit("stop typing", user_id);
  });

  socket.on("typing", ({ user_id, friend_id }) => {
    io.to(friend_id).emit("typing", user_id);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
