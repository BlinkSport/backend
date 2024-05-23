test.ts
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
    console.log('Authenticated user:', user)

    // Récupération et validation des données de la requête avec le validateur de modification
    const userData = await request.validateUsing(updateUserValidator)
    console.log('Validated user data:', userData)

    // Traitement pour le téléchargement et la mise à jour de l'image de profil, si fournie
    if (userData.thumbnail) {
      let filename

      // Si l'utilisateur a déjà une miniature, on utilise son nom de fichier actuel
      if (user.thumbnail) {
        filename = user.thumbnail.split('/').pop() // Extraction du nom de fichier à partir de l'URL
      } else {
        // Sinon, on génère un nouveau nom de fichier unique
        filename = `${cuid()}.${userData.thumbnail.extname}`
      }

      const tempFilePath = `public/users/${filename}`
      await userData.thumbnail.move(app.makePath('public/users'), { name: filename })
      console.log('Thumbnail moved to:', tempFilePath)

      // Déplacement de l'image téléchargée dans le répertoire approprié
      const imageUrl = await uploadImageToS3(tempFilePath, bucketName, filename)
      console.log('Image uploaded to S3:', imageUrl)

      if (imageUrl.startsWith('Error')) {
        console.error('S3 Upload Error:', imageUrl)
        return response.status(500).json({
          error: imageUrl,
        })
      }

      if (imageUrl.length > 255) {
        console.error('Image URL too long:', imageUrl)
        return response.status(500).json({
          error: 'Generated image URL is too long to be stored in the database.',
        })
      }

      // Mise à jour du chemin de l'image dans la base de données
      user.thumbnail = imageUrl
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

    // Créer un message d'erreur détaillé basé sur l'erreur capturée
    const errorMessage = `Failed to update profile: ${error.message}`

    return response.status(500).json({
      error: errorMessage,
    })
  }
}
