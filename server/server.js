const express = require('express');
const mongoose = require('mongoose');
const { User, Event, Activity, Achievement } = require('./models/schemas');
require('dotenv').config();

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/vitus_activity";

mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("Could not connect to MongoDB:", err);
    process.exit(1);
  });

// User Routes
app.post('/api/users/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Event Routes
app.post('/api/events', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('creator', 'firstName lastName')
      .populate('participants', 'firstName lastName');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activity Routes
app.post('/api/activities', async (req, res) => {
  try {
    const newActivity = new Activity(req.body);
    await newActivity.save();
    
    // Update user's daily steps and total points
    await User.findByIdAndUpdate(req.body.user, {
      $inc: { 
        dailySteps: req.body.steps,
        totalPoints: Math.floor(req.body.steps / 100) // 1 point per 100 steps
      }
    });
    
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Leaderboard Routes
app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ totalPoints: -1 })
      .select('firstName lastName totalPoints avatarUrl department');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard/department/:department', async (req, res) => {
  try {
    const users = await User.find({ department: req.params.department })
      .sort({ totalPoints: -1 })
      .select('firstName lastName totalPoints avatarUrl');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});