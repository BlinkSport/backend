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

router
  .group(() => {
    router.get('register', [AuthController, 'register'])
    router.post('register', [AuthController, 'handleRegister'])
    router.post('login', [AuthController, 'handleLogin'])
    router.delete('logout', [AuthController, 'handleLogout']).use(middleware.auth())
  })
  .prefix('/api/auth')

// Route accessible uniquement par les users authentiifiés
router
  .get('protected', async ({ auth, response }) => {
    try {
      const user = auth.getUserOrFail()
      return response.ok(user)
    } catch (error) {
      return response.unauthorized({ error: 'User not found' })
    }
  })
  .use(middleware.auth())
