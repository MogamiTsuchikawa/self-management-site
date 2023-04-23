export const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://manage.mogami.dev"
    : "http://localhost:3000";
