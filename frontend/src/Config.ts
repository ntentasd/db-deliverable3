declare global {
  interface Window {
    env: {
      REACT_APP_BACKEND_URL: string;
    };
  }
}

const Config = {
  environment: window.env?.REACT_APP_BACKEND_URL || "http://localhost:8000",
};

export default Config;
