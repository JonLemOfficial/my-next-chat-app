'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert('Users', [{
       username: 'jonathan',
       fullname: 'Jonathan Lemos',
       password: '',
       email: 'jonathan@example.com',
       role: 'user'
     }, {
       username: 'mileidy',
       fullname: 'Mileidy Perez',
       password: '',
       email: 'mileidy@example.com',
       role: 'user'
     }, {
       username: 'marc',
       fullname: 'Marc Hudson',
       password: '',
       email: 'marc@example.com',
       role: 'user'
     }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
