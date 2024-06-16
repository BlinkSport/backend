import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await User.createMany([
      {
        lastname: 'toto',
        firstname: 'titi',
        email: 'virk@adonisjs.com',
        password: '12345678',
        phoneNumber: '0611111111',
        // birthdate: new Date('1998-02-03'),
        biography: 'je suis gentil',
        location: 'Usa',
        latitude: 45,
        longitude: 18,
        status: 'voyant',
      },
      {
        lastname: 'Jhon',
        firstname: 'titi',
        email: 'tefjb@adonisjs.com',
        password: 'secpooit1239',
        phoneNumber: '0622222222',
        // birthdate: new Date('1998-02-04'),
        biography: 'je suis méchant',
        location: 'Paris',
        latitude: 45,
        longitude: 18,
        status: 'aveugle',
      },
      {
        lastname: 'Pouder',
        firstname: 'titi',
        email: 'uert@adonisjs.com',
        password: 'secret123',
        phoneNumber: '0611111111',
        // birthdate: new Date('1998-02-04'),
        biography: "j'aime le sport",
        location: 'Pérou',
        latitude: 45,
        longitude: 18,
        status: 'malvoyant',
      },
      {
        lastname: 'Seda',
        firstname: 'titi',
        email: 'seda@adonisjs.com',
        password: 'sret123jhy',
        phoneNumber: '0687960474',
        // birthdate: new Date('1998-02-04'),
        biography: 'je suis gentil aussi',
        location: 'Brésil',
        latitude: 45,
        longitude: 18,
        status: 'parent',
      },
      {
        lastname: 'Ken',
        firstname: 'titi',
        email: 'yama@adonisjs.com',
        password: '123458jhy',
        phoneNumber: '0687968574',
        // birthdate: new Date('1998-02-85'),
        biography: 'je suis neutre',
        location: 'Stockolm',
        latitude: 45,
        longitude: 18,
        status: 'voyant',
      },
    ])
  }
}
