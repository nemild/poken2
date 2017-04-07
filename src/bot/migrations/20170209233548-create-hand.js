'use strict';

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('hands', {
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
        state: {
          type: Sequelize.ENUM('anteAndBlinds', 'preflop', 'flop', 'turn', 'river', 'complete'),
          allowNull: false,
        },
        waitingGameUserId: {
            type: Sequelize.INTEGER,
            allowNull: true
            references: { model: 'gameUsers', key: 'id' }
          },
        pokerCardStateData: {
            type: Sequelize.JSONB,
            defaultValue: {}
          }
        gameUserStatuses: {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: []
          },
          dealerPosition: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 1
          },
      currentPosition: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      largestAmount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
        },
        bigBlind: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        smallBlind: {
            type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('hands');
  },
};
