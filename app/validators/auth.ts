import vine from '@vinejs/vine'

// On valide les données founis par le formulaire d'inscription
export const registerUserValidator = vine.compile(
  vine.object({
    username: vine.string().escape().trim().minLength(3).alphaNumeric(),
    email: vine
      .string()
      .email()
      .unique(async (db, value) => {
        // On vérifie que l'email n'est pas déjà utilisé
        const users = await db.from('users').where('email', value).first()
        // On retourne false si l'email n'est pas encore utilisé
        return !users
      }),

    password: vine.string().minLength(8).maxLength(32),
    thumbnail: vine.file({ extnames: ['jpg', 'png'], size: '10mb' }).optional(),
  })
)

// Login
export const loginUserValidator = vine.compile(
  vine.object({
    email: vine.string().email(),

    password: vine.string().minLength(8).maxLength(32),
  })
)

// Update
export const updateUserValidator = vine.compile(
  vine.object({
    username: vine.string().escape().trim().minLength(3).alphaNumeric().optional(),
    thumbnail: vine.file({ extnames: ['jpg', 'png'], size: '10mb' }).optional(),
  })
)
