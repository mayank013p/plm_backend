module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(50)
    },
    last_name: {
      type: DataTypes.STRING(50)
    },
    display_name: {
      type: DataTypes.STRING(100)
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    bio: {
      type: DataTypes.TEXT
    },
    profile_picture: {
      type: DataTypes.STRING(255)
    },
    education_level: {
      type: DataTypes.STRING(100)
    },
    field_of_study: {
      type: DataTypes.STRING(100)
    },
    specialization: {
      type: DataTypes.JSONB
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    last_login_at: {
      type: DataTypes.DATE
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users', // matches the actual table name in DB
    timestamps: false   // because you're managing created_at and updated_at manually
  });

  return User;
};
