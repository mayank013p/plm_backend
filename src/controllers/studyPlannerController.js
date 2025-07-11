const { sequelize } = require('../models');

exports.getStudyPlannerEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const [events] = await sequelize.query(`
      SELECT 
        id,
        title,
        subject,
        description,
        event_date,
        event_time,
        type,
        priority,
        location,
        reminder,
        completed,
        material_id,
        created_at,
        updated_at
      FROM study_events
      WHERE user_id = :userId
      ORDER BY event_date ASC, event_time ASC
    `, {
      replacements: { userId }
    });

    res.status(200).json({ study_events: events });
  } catch (err) {
    console.error('Error fetching study planner events:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createStudyPlannerEvent = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const {
      title,
      subject,
      description,
      event_date,
      event_time,
      type,
      priority,
      location,
      reminder,
      completed,
      material_id
    } = req.body;

    const [result] = await sequelize.query(
      `
      INSERT INTO study_events (
        user_id,
        title,
        subject,
        description,
        event_date,
        event_time,
        type,
        priority,
        location,
        reminder,
        completed,
        material_id,
        created_at,
        updated_at
      ) VALUES (
        :user_id, :title, :subject, :description, :event_date, :event_time,
        :type, :priority, :location, :reminder, :completed, :material_id,
        NOW(), NOW()
      ) RETURNING *;
      `,
      {
        replacements: {
          user_id: userId,
          title,
          subject,
          description,
          event_date,
          event_time,
          type,
          priority,
          location,
          reminder,
          completed : completed || false,
          material_id: material_id || null
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json({ message: 'Event created successfully', event: result[0] });
  } catch (err) {
    console.error('Create Event Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateStudyPlannerEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const {
      title,
      subject,
      description,
      event_date,
      event_time,
      type,
      priority,
      location,
      reminder,
      completed,
      material_id
    } = req.body;

    const [result] = await sequelize.query(
      `
      UPDATE study_events
      SET
        title = :title,
        subject = :subject,
        description = :description,
        event_date = :event_date,
        event_time = :event_time,
        type = :type,
        priority = :priority,
        location = :location,
        reminder = :reminder,
        completed = :completed,
        material_id = :material_id,
        updated_at = NOW()
      WHERE id = :event_id AND user_id = :user_id
      RETURNING id;
      `,
      {
        replacements: {
          title,
          subject,
          description,
          event_date,
          event_time,
          type,
          priority,
          location,
          reminder,
          completed,
          material_id: material_id || null,
          event_id: eventId,
          user_id: userId
        },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('Update Event Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    const [result] = await sequelize.query(
      `
      DELETE FROM study_events
      WHERE id = :event_id AND user_id = :user_id
      RETURNING id;
      `,
      {
        replacements: {
          event_id: eventId,
          user_id: userId
        },
        type: sequelize.QueryTypes.DELETE
      }
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete Event Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};