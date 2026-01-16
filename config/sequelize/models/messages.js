'use strict';

import { Model } from 'sequelize';
/** @type {import('sequelize-cli').Model} */
const messages = (sequelize, DataTypes) => {
  class Messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Messages.init({
    message: DataTypes.STRING,
    sender: DataTypes.NUMBER,
    receiver: DataTypes.NUMBER,
    sent_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Messages',
  });
  return Messages;
};

export default messages