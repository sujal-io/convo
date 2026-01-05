import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
  // Handle user login
  res.send('Login route');
});

export default router;