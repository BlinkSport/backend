import User from '#models/user'
import app from '@adonisjs/core/services/app'
import { registerUserValidator, loginUserValidator, updateUserValidator } from '#validators/auth'
import { uploadImageToS3 } from '#services/as3_service'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import { toPng } from 'jdenticon'
import { unlink } from 'node:fs/promises'
import { writeFile } from 'node:fs/promises' // Utilisez la version promise pour gérer les opérations de manière asynchrone

export default class AuthController {
  // Inscription de l'utilisateur
  async handleRegister({ request, response }: HttpContext) {
    const bucketName = env.get('AWS_BUCKET_NAME')

    if (!bucketName) {
      return response.status(500).json({
        error: 'AWS_BUCKET_NAME is not defined in environment variables.',
      })
    }

    // On récupère les informations validées
    const payload = await request.validateUsing(registerUserValidator)
    const { thumbnail, username } = payload

    try {
      let imageUrl

      if (!thumbnail) {
        // On génère une icône par défaut et l'enregistre
        const png = toPng(username, 100)
        const filename = `${username}_${cuid()}.png`
        const tempFilePath = `public/users/${filename}`
        // Enregistre l'image par défaut dans un fichier temporaire
        await writeFile(tempFilePath, png)
        imageUrl = await uploadImageToS3(tempFilePath, bucketName, filename)
        await unlink(tempFilePath) // Supprime le fichier temporaire après l'upload
      } else {
        // Gérer l'upload de l'image de thumbnail
        const filename = `${cuid()}_${Date.now()}.${thumbnail.extname}` // On génère un nom unique
        const tempFilePath = `public/users/${filename}`
        await thumbnail.move(app.makePath('public/users'), { name: filename })
        imageUrl = await uploadImageToS3(tempFilePath, bucketName, filename)
      }

      // Création de l'utilisateur dans la base de données
      await User.create({
        ...payload,
        thumbnail: imageUrl,
      })

      // Réponse au client
      return response.status(201).json({ message: 'User created' })
    } catch (error) {
      console.error('Failed to process registration:', error)
      return response.status(500).json({
        error: error.message || 'Unknown error',
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

  async getUserProfile({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      return response.ok(user.serialize())
    } catch (error) {
      console.error('Profile Retrieval Error:', error)
      return response.unauthorized({ error: 'User not authenticated' })
    }
  }
  // Update
  async handleEditAccount({ auth, request, response }: HttpContext) {
    const bucketName = env.get('AWS_BUCKET_NAME')

    if (!bucketName) {
      return response.status(500).json({
        error: 'AWS_BUCKET_NAME is not defined in environment variables.',
      })
    }

    try {
      // Récupération de l'utilisateur authentifié (grâce à auth)
      const user = await auth.getUserOrFail()
      // Récupération et validation des données de la requête avec le validateur de modification
      const userData = await request.validateUsing(updateUserValidator)
      // Initialise la variable imageUrl avec la valeur actuelle de la miniature de l'utilisateur
      let imageUrl = user.thumbnail

      // Vérifie si une nouvelle miniature a été fournie dans les données de la requête
      if (userData.thumbnail) {
        // Récupère la miniature des données de la requête
        const thumbnail = userData.thumbnail
        // Génère un nom de fichier unique pour la miniature
        const filename = `${cuid()}_${Date.now()}.${thumbnail.extname}`
        // Détermine le chemin temporaire où la miniature sera stockée
        const tempFilePath = `public/users/${filename}`
        // Déplace la miniature téléchargée vers le répertoire public/users avec le nom de fichier généré
        await thumbnail.move(app.makePath('public/users'), { name: filename })
        // Télécharge la miniature vers AWS S3 et récupère l'URL de l'image
        imageUrl = await uploadImageToS3(tempFilePath, bucketName, filename)
        // Supprime le fichier temporaire après l'upload vers S3
        await unlink(tempFilePath)
      }
      // Fusionne les données validées avec l'utilisateur actuel et met à jour l'URL de la miniature
      user.merge({ ...userData, thumbnail: imageUrl })
      // Enregistre les modifications apportées à l'utilisateur dans la base de données
      await user.save()

      return response.ok({
        message: 'User profile updated successfully',
        data: user,
      })
    } catch (error) {
      console.error('Edit Account Error:', error)
      return response.status(500).json({
        error: `Failed to update profile: ${error.message}`,
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
