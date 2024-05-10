import vine from '@vinejs/vine'

// On valide les données founis par le formulaire d'inscription
export const loginUserValidator = vine.compile(
  vine.object({
    email: vine.string().email(),

    password: vine.string().minLength(8).maxLength(32),
  })
)
