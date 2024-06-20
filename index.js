// app.js
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./app/Config/database');
const userRoutes = require('./app/Routes/userRoute');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());

// Connect to database
connectDB();

// Routes
app.use('/api/users', userRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});