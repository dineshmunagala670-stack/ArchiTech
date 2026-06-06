const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');

router.use('/users', userRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Hello from ArchiTech Express API!' });
});

module.exports = router;