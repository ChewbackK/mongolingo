const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db/connection');
const dataRouter = require('./routes/data');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    const db = await connectDB();
    app.locals.db = db;

    // Auto-load demo data if all collections are empty
    try {
      const counts = await Promise.all(dataRouter.COLLECTIONS.map(n => db.collection(n).countDocuments()));
      if (counts.every(c => c === 0)) {
        console.log('Collections vides, chargement automatique des données de démo...');
        await dataRouter.loadDemoData(db);
        console.log('Données de démo chargées.');
      }
    } catch (autoLoadErr) {
      console.warn(`Auto-chargement ignoré : ${autoLoadErr.message}`);
    }

  } catch (err) {
    console.error(`MongoDB non disponible: ${err.message}`);
    console.log('Le serveur demarre sans connexion MongoDB. Lancez mongod puis rechargez.');
    app.locals.db = null;
  }

  app.use('/api/health', require('./routes/health'));
  app.use('/api/quiz', require('./routes/quiz'));
  app.use('/api/collections', require('./routes/collections'));
  app.use('/api/data', dataRouter);

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
