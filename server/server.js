const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { sql, poolPromise } = require("./db"); // Ensure database connection
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
// ✅ Fix: Use SESSION_SECRET instead of JWT_SECRET
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// 🔹 Route to Create an Event
app.post("/events", async (req, res) => {
  try {
    const {
      title,
      description,
      activity,
      goal,
      start_date,
      end_date,
      location,
      event_type,
      total_participants,
      team_count,
      members_per_team,
    } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("activity", sql.NVarChar, activity)
      .input("goal", sql.Int, goal)
      .input("start_date", sql.DateTime, start_date)
      .input("end_date", sql.DateTime, end_date)
      .input("location", sql.NVarChar, location)
      .input("event_type", sql.NVarChar, event_type)
      .input("total_participants", sql.Int, total_participants)
      .input("team_count", sql.Int, team_count)
      .input("members_per_team", sql.Int, members_per_team)
      .query(`
        INSERT INTO events 
        (title, description, activity, goal, start_date, end_date, location, event_type, total_participants, team_count, members_per_team)
        OUTPUT INSERTED.id
        VALUES 
        (@title, @description, @activity, @goal, @start_date, @end_date, @location, @event_type, @total_participants, @team_count, @members_per_team)
      `);

    // Return the ID of the newly created event
    const eventId = result.recordset[0].id;
    
    res.status(201).json({ 
      success: true, 
      message: "Event created successfully", 
      eventId: eventId 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔹 Route to Fetch All Events
app.get("/events", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM events");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Route to Update an Event
app.put("/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      title,
      description,
      activity,
      goal,
      start_date,
      end_date,
      location,
      event_type,
      total_participants,
      team_count,
      members_per_team,
    } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.NVarChar, eventId)
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("activity", sql.NVarChar, activity)
      .input("goal", sql.Int, goal)
      .input("start_date", sql.DateTime, start_date)
      .input("end_date", sql.DateTime, end_date)
      .input("location", sql.NVarChar, location)
      .input("event_type", sql.NVarChar, event_type)
      .input("total_participants", sql.Int, total_participants)
      .input("team_count", sql.Int, team_count)
      .input("members_per_team", sql.Int, members_per_team)
      .query(`
        UPDATE events
        SET title = @title,
            description = @description,
            activity = @activity,
            goal = @goal,
            start_date = @start_date,
            end_date = @end_date,
            location = @location,
            event_type = @event_type,
            total_participants = @total_participants,
            team_count = @team_count,
            members_per_team = @members_per_team
        WHERE id = @id
      `);

    res.json({ success: true, message: "Event updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔹 Route to Delete an Event
app.delete("/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.NVarChar, eventId)
      .query("DELETE FROM events WHERE id = @id");
      
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
