const isDevelopment = process.env.NODE_ENV !== "production";

console.log(isDevelopment);

export const publicStaticBase = isDevelopment ? 'http://localhost:3000/public/' : 'http://localhost:3001/public/';
export const urlBase = isDevelopment ? 'http://localhost:3000/server' : 'http://localhost:3001/server';