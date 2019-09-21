'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.addColumn('users',
      {
        UserId: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        FirstName: DataTypes.STRING,
        LastName: DataTypes.STRING,
        Username: {
          type: DataTypes.STRING,
          unique: true
        },
        Password: DataTypes.STRING,
        Email: {
          type: DataTypes.STRING,
          unique: true
        },
        Admin: {
          type: DataTypes.BOOLEAN,
          default: false,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        }
      },
      {
        timestamps: false
      }
    )]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn('users', 'DateFormed')]);
  }
};
