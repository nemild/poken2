'use strict';

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('pots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      handId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'hands', key: 'id' },
      },
      balance: {
          type: Sequelize.DECIMAL,
          defaultValue: 0
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
    return queryInterface.dropTable('pots');
  },
};

