'use strict';

const Hand = require('./hand');

module.exports = function(sequelize, DataTypes) {
  const Pot = sequelize.define('pot', {
    handId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Hand, key: 'handId' }
    },
    balance: {
      type: DataTypes.DECIMAL,
      defaultValue: 0
    }
  }, {
    hooks: { },
    indexes: [],
    instanceMethods: {
    },
    classMethods: {
      associate (models) {
        Pot.belongsTo(models.hand);
      }
    }
  });

  return Pot;
};
