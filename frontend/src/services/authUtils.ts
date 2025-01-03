import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  email: string;
  role: string;
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

export const isAdminJWT = (): boolean => {
  const token = localStorage.getItem("authToken");
  if (token) {
    try {
      const decoded: JwtPayload & { role?: string } = jwtDecode(token);
      return decoded.role === "Admin";
    } catch (error: any) {
      console.error("Failed to decode token:", error);
      return false;
    }
  }
  return false;
}