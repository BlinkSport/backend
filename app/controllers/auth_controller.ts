import User from '#models/user'
import app from '@adonisjs/core/services/app'
import { registerUserValidator } from '#validators/auth'
import { loginUserValidator } from '#validators/login_user'
import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import { toPng } from 'jdenticon'
import { writeFile } from 'node:fs/promises' // Utilisez la version promise pour gérer les opérations de manière asynchrone
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { messages } from '@vinejs/vine/defaults'

export default class AuthController {
  async register() {
    return this.register.name
  }

  // Register
  async handleRegister({ request, response }: HttpContext) {
    // On récupère les informations validées
    const { email, username, thumbnail, password } =
      await request.validateUsing(registerUserValidator)

    try {
      let filePath

      const directoryPath = path.join(app.makePath('public'), 'users')
      if (!existsSync(directoryPath)) {
        mkdirSync(directoryPath, { recursive: true }) // Crée le répertoire s'il n'existe pas
      }

      if (!thumbnail) {
        // On génère une icône par défaut et l'enregistre
        const png = toPng(username, 100)
        const filename = `${username}.png`
        filePath = `public/users/${filename}`
        await writeFile(filePath, png) // Assurez-vous d'utiliser 'fs/promises' pour writeFile
      } else {
        // Gérer l'upload de l'image de thumbnail
        const filename = `${cuid()}.${thumbnail.extname}`
        filePath = `public/users/${filename}`
        await thumbnail.move(app.makePath('public/users'), { name: filename })
      }

      // Création de l'utilisateur dans la base de données
      await User.create({
        email,
        username,
        thumbnail: filePath,
        password,
      })

      // Réponse au client
      return response.status(201).json({ message: 'User created' })
    } catch (error) {
      console.error('Failed to process registration:', error)
      return response.status(500).json({
        message: 'Failed to register user',
        error: error.message || 'Unknow error',
      })
    }
  }

  // Login
  async handleLogin({ request, response }: HttpContext) {
    // Récupération et validation des données de la requête avec le validateur de connexion
    const { email, password } = await request.validateUsing(loginUserValidator)

    // Vérification des informations d'identification de l'utilisateur + récupération de l'utilisateur si valide
    const user = await User.verifyCredentials(email, password)

    // Création d'un token d'accès pour les utilisateurs authentifié
    const token = await User.accessTokens.create(user)

    // Réponse avec le token et les données utilisateur sérialisés
    return response.ok({
      token: token,
      ...user.serialize(),
    })
  }

  // Logout
  async handleLogout({ auth, response }: HttpContext) {
    // Récupération de l'utilisateur authentifié (grâce à auth)
    const user = auth.getUserOrFail()

    // Récupération du token de l'utilisateur
    const token = auth.user?.currentAccessToken.identifier

    // Si le token n'existe pas, on renvoie une erreur
    if (!token) {
      return response.badRequest({ message: 'Token not found' })
    }

    // On supprime le token de l'user
    await User.accessTokens.delete(user, token)

    return response.ok({ message: 'Logged out' })
  }
}
