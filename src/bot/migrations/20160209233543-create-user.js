'use strict';

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        tokenIdee: {
          type: Sequelize.STRING,
          allowNull: false
          },
        username: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        address: {
              type: Sequelize.STRING,
              allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }, {})
      .then(function() {
        return Promise.all([
        ]);
      });
  },
  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  },
};
