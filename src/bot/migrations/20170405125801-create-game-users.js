'use strict';

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('gameUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'games', key: 'id' }
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
        state: {
          type: Sequelize.ENUM('spectating', 'playing'),
          allowNull: false,
        },
        position: {
          type: Sequelize.INTEGER,
          allowNull: true,
          },
          balance: {
            type: Sequelize.DECIMAL,
            defaultValue: 0,
            allowNull: true
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
    return queryInterface.dropTable('gameUsers');
  },
};

