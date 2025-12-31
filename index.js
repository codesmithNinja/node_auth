
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");

dotenv.config();
const app = require('./src/app/app');
setRoutes(app);
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);