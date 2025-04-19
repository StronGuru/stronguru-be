const allowedOrigins = [process.env.CLIENT_ORIGIN];

const corsOptions = {
  origin: function (origin, callback) {
    // In dev può essere null (es. Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;
