import User from '#models/user'
import app from '@adonisjs/core/services/app'
import { registerUserValidator, loginUserValidator, updateUserValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import { toPng } from 'jdenticon'
import { writeFile } from 'node:fs/promises' // Utilisez la version promise pour gérer les opérations de manière asynchrone
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

export default class AuthController {
  async register() {
    return this.register.name
  }

  // Register
  async handleRegister({ request, response }: HttpContext) {
    // On récupère les informations validées
    const payload = await request.validateUsing(registerUserValidator)
    const { thumbnail, username } = payload

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
        ...payload,
        thumbnail: filePath,
      })

      // Réponse au client
      return response.status(201).json({ message: 'User created' })
    } catch (error) {
      console.error('Failed to process registration:', error)
      return response.status(500).json({
        //message: 'Failed to register user',
        error: error.message || 'Unknow error',
      })
    }
  }

  // Login
  async handleLogin({ request, response }: HttpContext) {
    // Récupération et validation des données de la requête avec le validateur de connexion
    const { email, password } = await request.validateUsing(loginUserValidator)

    try {
      // Vérification des informations d'identification de l'utilisateur + récupération de l'utilisateur si valide
      const user = await User.verifyCredentials(email, password)

      // Création d'un token d'accès pour les utilisateurs authentifié
      const token = await User.accessTokens.create(user)

      // Réponse avec le token et les données utilisateur sérialisés
      return response.ok({
        token: token,
        ...user.serialize(),
      })
    } catch (error) {
      // Réponse en cas d'erreur
      console.error('Login Error:', error)
      return response.unauthorized({
        error: 'Login failed',
      })
    }
  }

  // Update
  async handleEditAccount({ auth, request, response }: HttpContext) {
    try {
      // Récupération de l'utilisateur authentifié (grâce à auth)
      const user = auth.getUserOrFail()

      // Récupération et validation des données de la requête avec le validateur de modification
      const userData = await request.validateUsing(updateUserValidator)

      // Traitement pour le téléchargement et la mise à jour de l'image de profil, si fournie
      if (userData.thumbnail) {
        const directoryPath = path.join(app.makePath('public'), 'users')

        // Création du répertoire s'il n'existe pas
        if (!existsSync(directoryPath)) {
          mkdirSync(directoryPath, { recursive: true })
        }

        // Génération d'un nom de fichier unique pour l'image
        const filename = `${cuid()}.${userData.thumbnail.extname}`
        const filePath = path.join(directoryPath, filename)

        // Déplacement de l'image téléchargée dans le répertoire approprié
        await userData.thumbnail.move(directoryPath, { name: filename })

        // Mise à jour du chemin de l'image dans la base de données
        user.thumbnail = filePath
      }

      // Fusion des données validées avec l'utilisateur actuel et enregistrement des modifications
      user.merge(userData)
      await user.save()

      // Réponse au client avec l'utilisateur mis à jour
      return response.ok({
        message: 'User profile updated successfully',
        data: user,
      })
    } catch (error) {
      console.error('Edit Account Error:', error)
      return response.unauthorized({
        error: 'Failed to update profile',
      })
    }
  }

  // Logout
  async handleLogout({ auth, response }: HttpContext) {
    try {
      // Récupération de l'utilisateur authentifié (grâce à auth)
      const user = auth.getUserOrFail()

      // Récupération du token de l'utilisateur
      const token = auth.user?.currentAccessToken.identifier

      // Si le token n'existe pas, on renvoie une erreur
      if (!token) {
        return response.badRequest({ message: 'Logout failed' })
      }

      // On supprime le token de l'user
      await User.accessTokens.delete(user, token)

      return response.ok({ message: 'Logged out' })
    } catch (error) {
      console.error('Logout Error:', error)
      return response.unauthorized({ error: 'Failed to logout' })
    }
  }

  // Delete
  async handleDeleteAccount({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      await user.delete()
      return response.ok({ message: 'User deleted successfully' })
    } catch (error) {
      console.error('Failed to delete account:', error)

      return response.internalServerError({
        message: 'Failed to delete account',
      })
    }
  }
}
