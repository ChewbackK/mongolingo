const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db/connection');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

async function start() {
  const db = await connectDB();
  app.locals.db = db;

  // Routes will be added in later tasks
  app.use('/api/health', require('./routes/health'));
  app.use('/api/quiz', require('./routes/quiz'));
  app.use('/api/collections', require('./routes/collections'));
  app.use('/api/data', require('./routes/data'));

  // Serve client build in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(console.error);
