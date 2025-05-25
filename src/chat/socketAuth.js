import cookie from "cookie";
import jwt from "jsonwebtoken";

export function authenticateSocket(socket, next) {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies['accessToken'];

    if (!token) {
      return next(new Error("Authentication error: No token"));
    }
    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded);
    socket.user = decoded; // Attach user info to socket
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
}
