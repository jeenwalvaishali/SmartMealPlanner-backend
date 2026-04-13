require('dotenv').config();
const app = require('./app');
const cors = require('cors');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

app.use(cors({
  origin: "http://localhost:5174",  // your frontend URL
  credentials: true,
}));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
