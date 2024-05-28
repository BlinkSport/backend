/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')
const UserSportsController = () => import('#controllers/user_favorite_sports_controller')

// Routes ne nécessitant pas d'authentification
router
  .group(() => {
    router.post('register', [AuthController, 'handleRegister'])
    router.post('login', [AuthController, 'handleLogin'])
  })
  .prefix('/api/auth')

// Routes nécessitant une authentification
router
  .group(() => {
    router.get('get', [AuthController, 'getUserProfile'])
    router.put('edit', [AuthController, 'handleEditAccount'])
    router.delete('delete', [AuthController, 'handleDeleteAccount'])
    router.delete('logout', [AuthController, 'handleLogout'])
  })
  .use(middleware.auth())
  .prefix('/api/auth')

// Route accessible uniquement par les users authentiifiés
router
  .group(() => {
    router.get('get', [UserSportsController, 'index'])
    router.post('add', [UserSportsController, 'store'])
    router.put('update', [UserSportsController, 'update'])
    router.delete('delete', [UserSportsController, 'destroy'])
  })
  .use(middleware.auth())
  .prefix('api/user/lovedsports')
