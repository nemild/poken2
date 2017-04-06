'use strict';

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('games', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        state: {
          type: Sequelize.ENUM('waiting', 'playing', 'completed'),
          allowNull: false,
        },
        bigBlind: {
          type: Sequelize.DECIMAL,
          allowNull: true,
        },
        ante: {
                type: Sequelize.DECIMAL,
                allowNull: true,
        },
        maxBuyin: {
                type: Sequelize.DECIMAL,
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
      });
  },
  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('games');
  },
};
