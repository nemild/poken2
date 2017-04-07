'use strict';

const User = require('./user');
const Game = require('./game');

// TODO: SET NEXT POSITION, beforeCreate

module.exports = function(sequelize, DataTypes) {
  const GameUser = sequelize.define('gameUser', {
      gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Game,
          key: 'gameId'
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: User,
          key: 'userId'
        }
      },
        state: {
          type: DataTypes.ENUM('spectating', 'playing'),
          allowNull: false
        },
        position: { // 0 - 8
            type: DataTypes.INTEGER,
            allowNull: true
          },
          balance: {
            type: DataTypes.DECIMAL,
            defaultValue: 0,
            allowNull: true
          }
  }, {
    hooks: {},
    indexes: [],
    instanceMethods: {
    },
    classMethods: {
      associate (models) {
        GameUser.belongsTo(models.user);
        GameUser.belongsTo(models.game);
      }
    }
  });

  // User.hook('beforeCreate', function setHash(user, options) {
  //   return new sequelize.Promise(function(resolve, reject) {
  //     bcrypt.genSalt(10, function(err, salt) {
  //       if (err) {
  //         return reject(Error('Couldn\'t generate password hash'));
  //       }
  //       bcrypt.hash(user.password, salt, null, function(err, hash) {
  //         if (err) {
  //           return reject(Error('Couldn\'t generate password hash'));
  //         }
  //         user.password = hash; // eslint-disable-line no-param-reassign
  //         return resolve();
  //       });
  //     });
  //   });
  // });

  return GameUser;
};
