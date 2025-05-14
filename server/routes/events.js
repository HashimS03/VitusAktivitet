const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");
const { authenticateJWT } = require("../server");

// Get all events for the authenticated user
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, req.session.userId).query(`
        SELECT e.*
        FROM [EVENTS] e
        LEFT JOIN [EVENT_PARTICIPANTS] ep ON e.Id = ep.event_id
        WHERE e.created_by = @userId OR ep.user_id = @userId
      `);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch events: ${err.message}`,
    });
  }
});

// Create a new event
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { 
      title, description, activity, goal, start_date, end_date, location, 
      event_type, total_participants, team_count, members_per_team, auto_join 
    } = req.body;
    
    // Validate required fields
    if (!title || !start_date || !end_date || !activity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, start_date, end_date, and activity are required",
      });
    }

    // Insert the event
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description || "")
      .input("activity", sql.NVarChar, activity)
      .input("goal", sql.Int, goal || 0)
      .input("start_date", sql.DateTime, new Date(start_date))
      .input("end_date", sql.DateTime, new Date(end_date))
      .input("location", sql.NVarChar, location || "")
      .input("event_type", sql.NVarChar, event_type || "individual")
      .input("total_participants", sql.Int, total_participants || 0)
      .input("team_count", sql.Int, team_count || 0)
      .input("members_per_team", sql.Int, members_per_team || 0)
      .input("created_by", sql.Int, req.user.id)
      .query(`
        INSERT INTO [dbo].[EVENTS] 
        (title, description, activity, goal, start_date, end_date, location, 
         event_type, total_participants, team_count, members_per_team, created_by) 
        OUTPUT INSERTED.Id
        VALUES 
        (@title, @description, @activity, @goal, @start_date, @end_date, @location, 
         @event_type, @total_participants, @team_count, @members_per_team, @created_by)
      `);

    const eventId = result.recordset[0].Id;

    // Auto-join the user if requested
    if (auto_join) {
      await pool
        .request()
        .input("event_id", sql.Int, eventId)
        .input("user_id", sql.Int, req.user.id)
        .input("role", sql.NVarChar, "creator")
        .input("progress", sql.Int, 0)
        .query(`
          INSERT INTO [dbo].[EVENT_PARTICIPANTS] 
          (event_id, user_id, role, individual_progress) 
          VALUES 
          (@event_id, @user_id, @role, @progress)
        `);
    }

    res.json({
      success: true,
      message: "Event created successfully",
      eventId: eventId,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
});

// Update an event
router.put("/:Id", authenticateJWT, async (req, res) => {
  try {
    const eventId = req.params.Id;
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

    if (!title || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Title, start_date, and end_date are required",
      });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, req.session.userId)
      .query(
        "SELECT Id FROM [EVENTS] WHERE Id = @eventId AND created_by = @userId"
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you lack permission",
      });
    }

    await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description || null)
      .input("activity", sql.NVarChar, activity || null)
      .input("goal", sql.Int, goal || null)
      .input("start_date", sql.DateTime, new Date(start_date))
      .input("end_date", sql.DateTime, new Date(end_date))
      .input("location", sql.NVarChar, location || null)
      .input("event_type", sql.NVarChar, event_type || null)
      .input("total_participants", sql.Int, total_participants || null)
      .input("team_count", sql.Int, team_count || null)
      .input("members_per_team", sql.Int, members_per_team || null).query(`
        UPDATE [EVENTS]
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
        WHERE Id = @eventId
      `);

    res.json({ success: true, message: "Event updated successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to update event: ${err.message}`,
    });
  }
});

// Delete an event
router.delete("/:Id", authenticateJWT, async (req, res) => {
  try {
    const eventId = parseInt(req.params.Id, 10);
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid event ID format" 
      });
    }

    const pool = await poolPromise;
    const eventCheck = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query("SELECT Id, created_by FROM [EVENTS] WHERE Id = @eventId");

    if (eventCheck.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    const event = eventCheck.recordset[0];
    if (event.created_by !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this event",
      });
    }

    // Delete related records first
    await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query("DELETE FROM [EVENT_PARTICIPANTS] WHERE event_id = @eventId");

  

    // Delete the event
    const result = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query("DELETE FROM [EVENTS] WHERE Id = @eventId");

    if (result.rowsAffected[0] === 0) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to delete event" 
      });
    }

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to delete event: ${err.message}`,
    });
  }
});

// Get participants for an event
router.get("/:eventId/participants", authenticateJWT, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid event ID" 
      });
    }

    const userId = req.session.userId;
    const pool = await poolPromise;

    // Check if the event exists and the user is authorized
    const eventCheck = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId).query(`
        SELECT e.Id, e.event_type
        FROM [EVENTS] e
        LEFT JOIN [EVENT_PARTICIPANTS] ep ON e.Id = ep.event_id
        WHERE e.Id = @eventId AND (e.created_by = @userId OR ep.user_id = @userId)
      `);
    
    if (eventCheck.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Event not found or you lack permission",
      });
    }

    const event = eventCheck.recordset[0];
    const isTeamEvent = event.event_type === "team";

    // Fetch participants with team info
    const participants = await pool.request().input("eventId", sql.Int, eventId)
      .query(`
        SELECT 
          ep.user_id, 
          ep.team_id, 
          ep.progress AS individual_progress,
          t.progress AS team_progress,
          u.name
        FROM [EVENT_PARTICIPANTS] ep
        JOIN [USER] u ON ep.user_id = u.Id
        WHERE ep.event_id = @eventId
      `);

    res.json({
      success: true,
      isTeamEvent,
      participants: participants.recordset,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch participants: ${err.message}`,
    });
  }
});

// Check participation status
router.get("/:id/participation", authenticateJWT, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const pool = await poolPromise;
    
    // Query the EVENT_PARTICIPANTS table
    const result = await pool.request()
      .input('eventId', sql.Int, eventId)
      .input('userId', sql.Int, userId)
      .query(`
        SELECT id, user_id, event_id, team_id
        FROM EVENT_PARTICIPANTS
        WHERE event_id = @eventId AND user_id = @userId
      `);
    
    if (result.recordset.length > 0) {
      // User is participating
      const participant = result.recordset[0];
      res.json({
        success: true,
        isParticipating: true,
        participantId: participant.id,
        teamId: participant.team_id
      });
    } else {
      // User is not participating
      res.json({
        success: true,
        isParticipating: false
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to check participation status" 
    });
  }
});

// Join an event via QR Code
router.post("/join-event/:eventId", authenticateJWT, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid event ID" 
      });
    }

    const userId = req.session.userId;
    const pool = await poolPromise;

    // Event existence check
    const eventCheck = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query("SELECT Id, created_by FROM [EVENTS] WHERE Id = @eventId");
      
    if (eventCheck.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    const event = eventCheck.recordset[0];
    if (userId === event.created_by) {
      return res.status(400).json({ 
        success: false, 
        message: "You are the host of this event" 
      });
    }

    // Already participating check
    const participantCheck = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId)
      .query(
        "SELECT Id FROM [EVENT_PARTICIPANTS] WHERE event_id = @eventId AND user_id = @userId"
      );
      
    if (participantCheck.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You are already a participant in this event",
      });
    }


    // Add as participant
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("eventId", sql.Int, eventId)
      .input("teamId", sql.Int, teamId)
      .input("joinedAt", sql.DateTime, new Date())
      .input("progress", sql.Int, 0)
      .query(`
        INSERT INTO [EVENT_PARTICIPANTS] (user_id, event_id, team_id, joined_at, progress)
        VALUES (@userId, @eventId, @teamId, @joinedAt, @progress)
      `);

    res.status(201).json({ 
      success: true, 
      message: "Joined event successfully" 
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to join event: ${err.message}`,
    });
  }
});

// Update progress in an event
router.put("/:eventId/progress", authenticateJWT, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid event ID" 
      });
    }

    const userId = req.session.userId;
    const { progress } = req.body;

    if (progress === undefined || progress < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid progress value is required" 
      });
    }

    const pool = await poolPromise;

    // Validate event and user rights
    const eventCheck = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query("SELECT Id, created_by, event_type FROM [EVENTS] WHERE Id = @eventId");
      
    if (eventCheck.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    const event = eventCheck.recordset[0];
    const isHost = event.created_by === userId;

    // Check if the user is a participant
    const participantCheck = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId)
      .query("SELECT Id, team_id FROM [EVENT_PARTICIPANTS] WHERE event_id = @eventId AND user_id = @userId");

    if (!isHost && participantCheck.recordset.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not part of this event" 
      });
    }

    // Update participant progress
    await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId)
      .input("progress", sql.Int, progress)
      .query("UPDATE [EVENT_PARTICIPANTS] SET progress = @progress WHERE event_id = @eventId AND user_id = @userId");

    // Update team progress if it's a team event
    if (event.event_type === "team") {
      const teamId = participantCheck.recordset[0]?.team_id;
      if (!teamId && !isHost) {
        return res.status(400).json({ 
          success: false, 
          message: "No team assigned" 
        });
      }

      // Calculate average team progress
      const teamProgress = await pool
        .request()
        .input("teamId", sql.Int, teamId)
        .input("eventId", sql.Int, eventId)
        .query(`
          SELECT AVG(CAST(progress AS FLOAT)) as avgProgress
          FROM [EVENT_PARTICIPANTS]
          WHERE team_id = @teamId AND event_id = @eventId
        `);

      const avgProgress = Math.round(teamProgress.recordset[0].avgProgress || 0);
      
    }

    res.json({ success: true, message: "Progress updated successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to update progress: ${err.message}`,
    });
  }
});

// Add this route to handle event participation
router.post("/:id/participants", authenticateJWT, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const { user_role = "participant" } = req.body;

    // Check if the event exists
    const pool = await poolPromise;
    const eventCheck = await pool
      .request()
      .input("id", sql.Int, eventId)
      .query("SELECT * FROM [dbo].[EVENTS] WHERE Id = @id");

    if (eventCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if the user is already a participant
    const participantCheck = await pool
      .request()
      .input("event_id", sql.Int, eventId)
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT * FROM [dbo].[EVENT_PARTICIPANTS] 
        WHERE event_id = @event_id AND user_id = @user_id
      `);

    if (participantCheck.recordset.length > 0) {
      return res.json({
        success: true,
        message: "User is already participating in this event",
      });
    }

    // Add the participant
    await pool
      .request()
      .input("event_id", sql.Int, eventId)
      .input("user_id", sql.Int, userId)
      .input("role", sql.NVarChar, user_role)
      .input("progress", sql.Int, 0)
      .query(`
        INSERT INTO [dbo].[EVENT_PARTICIPANTS] 
        (event_id, user_id, role, individual_progress) 
        VALUES 
        (@event_id, @user_id, @role, @progress)
      `);

    res.json({
      success: true,
      message: "Joined event successfully",
    });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join event",
      error: error.message,
    });
  }
});

module.exports = router;