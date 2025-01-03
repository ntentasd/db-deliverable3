import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number;
}

export const setupTokenExpirationHandler = (token: string, onExpire: () => void) => {
  try {
    const decoded: JwtPayload = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - currentTime;

    if (timeLeft <= 0) {
      onExpire();
    } else {
      setTimeout(() => {
        onExpire();
      }, timeLeft * 1000);
    }
  } catch (error) {
    console.error("Failed to decode token:", error);
    onExpire();
  }
};
