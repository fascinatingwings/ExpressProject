const bcrypt = require("bcryptjs");

'use strict';
module.exports = (sequelize, DataTypes) => {
    const users = sequelize.define(
        'users',
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
            Deleted: DataTypes.BOOLEAN,
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
    );

    users.associate = function (models) {
        users.belongsTo(models.users, {
            foreignKey: 'UserId'
        });
    }
    users.prototype.comparePassword = function (plainTextPassword) {
        let user = this;
        return bcrypt.compareSync(plainTextPassword, user.Password)
    };

    return users;
};
