module.exports = (sequelize, DataTypes) => {
  const UserSettings = sequelize.define('User_settings', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'America/New_York',
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'English',
    },
  });

  return UserSettings;
};
