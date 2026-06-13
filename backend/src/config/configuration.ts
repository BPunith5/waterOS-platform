export default () => ({
  port: parseInt(process.env.PORT ?? '5000', 10),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/waterOS',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
});
