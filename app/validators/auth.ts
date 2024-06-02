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
    phoneNumber: vine
      .string()
      .alphaNumeric()
      .regex(/^(06|07)[0-9]{8}$/), // Valide que le numéro contient exactement 10 chiffres
    biography: vine.string().escape().trim().optional(),
    location: vine.string().trim().escape(),
    availability: vine.string().escape().optional(),
    status: vine.enum(['aveugle', 'malvoyant', 'bénévole']),
    profilImage: vine.file({ extnames: ['jpg', 'png'], size: '10mb' }).optional(),
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
    biography: vine.string().escape().trim().optional(),
    location: vine.string().trim().escape().optional(),
    availability: vine.string().escape().optional(),
    status: vine.enum(['aveugle', 'malvoyant', 'bénévole']).optional(),
    profilImage: vine.file({ extnames: ['jpg', 'png'], size: '10mb' }).optional(),
    phoneNumber: vine
      .string()
      .alphaNumeric()
      .regex(/^(06|07)[0-9]{8}$/)
      .optional(),
  })
)
