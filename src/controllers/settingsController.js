const { User, UserSettings } = require('../models');
const { decrypt } = require('../utils/cryptoUtils'); // if password was encrypted
const { sequelize } = require('../models');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user and settings
    const user = await User.findByPk(userId);
    const settings = await UserSettings.findOne({ where: { user_id: userId } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const profileData = {
      username: user.username,
      displayName: user.display_name,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      educationLevel: user.education_level,
      fieldOfStudy: user.field_of_study,
      specialization : user.specialization,
      // You may also want to populate selectedSpecializations if using relation table
      settings: {
        timezone: settings?.timezone || 'America/New_York',
        language: settings?.language || 'English',
      },
    };

    return res.status(200).json({ profile: profileData });
  } catch (err) {
    console.error('Get Profile Error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      displayName,
      firstName,
      lastName,
      email,
      phone,
      bio,
      educationLevel,
      fieldOfStudy,
      specialization,
      profilePicture,
      timezone,
      language
    } = req.body;

    // ✅ Step 1: Update 'users' table
    const userUpdateQuery = `
      UPDATE users
      SET
        display_name = :displayName,
        first_name = :firstName,
        last_name = :lastName,
        email = :email,
        phone = :phone,
        bio = :bio,
        education_level = :educationLevel,
        field_of_study = :fieldOfStudy,
        specialization = :specialization::jsonb,
        profile_picture = :profilePicture,
        updated_at = NOW()
      WHERE id = :userId
    `;

    await sequelize.query(userUpdateQuery, {
      replacements: {
        displayName,
        firstName,
        lastName,
        email,
        phone,
        bio,
        educationLevel,
        fieldOfStudy,
        specialization: JSON.stringify(specialization || []),
        profilePicture: profilePicture || null,
        userId
      }
    });

    // ✅ Step 2: Update 'user_settings' table (upsert)
    const settingsUpdateQuery = `
      INSERT INTO user_settings (user_id, timezone, language)
      VALUES (:userId, :timezone, :language)
      ON CONFLICT (user_id)
      DO UPDATE SET timezone = EXCLUDED.timezone, language = EXCLUDED.language
    `;

    await sequelize.query(settingsUpdateQuery, {
      replacements: {
        userId,
        timezone: timezone || 'UTC',
        language: language || 'English'
      }
    });

    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getAllUserSettings = async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM user_settings
      ORDER BY updated_at DESC;
    `;

    const [results] = await sequelize.query(query);

    res.status(200).json({ user_settings: results });
  } catch (error) {
    console.error('Error fetching user_settings:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      email_notifications,
      push_notifications,
      sound_enabled,
      course_reminders,
      assignment_deadlines,
      weekly_progress,
      marketing_emails,
      profile_visibility,
      show_progress,
      show_achievements,
      data_sharing,
      analytics_tracking,
      theme,
      font_size,
      compact_mode,
      reduced_motion,
      high_contrast
    } = req.body;

    const updateQuery = `
      UPDATE user_settings
      SET
        email_notifications = :email_notifications,
        push_notifications = :push_notifications,
        sound_enabled = :sound_enabled,
        course_reminders = :course_reminders,
        assignment_deadlines = :assignment_deadlines,
        weekly_progress = :weekly_progress,
        marketing_emails = :marketing_emails,
        profile_visibility = :profile_visibility,
        show_progress = :show_progress,
        show_achievements = :show_achievements,
        data_sharing = :data_sharing,
        analytics_tracking = :analytics_tracking,
        theme = :theme,
        font_size = :font_size,
        compact_mode = :compact_mode,
        reduced_motion = :reduced_motion,
        high_contrast = :high_contrast,
        updated_at = NOW()
      WHERE user_id = :userId
    `;

    await sequelize.query(updateQuery, {
      replacements: {
        email_notifications,
        push_notifications,
        sound_enabled,
        course_reminders,
        assignment_deadlines,
        weekly_progress,
        marketing_emails,
        profile_visibility,
        show_progress,
        show_achievements,
        data_sharing,
        analytics_tracking,
        theme,
        font_size,
        compact_mode,
        reduced_motion,
        high_contrast,
        userId
      }
    });

    res.status(200).json({ message: 'User settings updated successfully' });
  } catch (err) {
    console.error('Update Settings Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
