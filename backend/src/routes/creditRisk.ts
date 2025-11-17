import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const ML_URL =
  process.env.ML_SERVICE_URL || 'http://localhost:8000';

router.post('/predict', async (req, res) => {
  try {
    const mlResponse = await fetch(`${ML_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await mlResponse.json();
    res.json(data);
  } catch (err) {
    console.error('ML service error:', err);
    res.status(500).json({ error: 'Failed to connect to ML model' });
  }
});

export default router;
