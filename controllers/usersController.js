const User = require('../models/User')
const Field = require('../models/Field')
//maneja try catch
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length) {
        return res.status(400).json({ message: 'No se encontraron usuarios'})
    }
    res.json(users)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async(req, res) => {
    const { email, password, roles } = req.body;

    // Confirm data
    if(!email || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' })
    }

    // Check for duplicate
    const duplicate = await User.findOne({ email }).lean().exec()
    if(duplicate) {
        return res.status(409).json({ message: 'Usuario duplicado' })
    }

    //Hash Pass
    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = {email, "password": hashedPwd, roles}

    // Create and store new user
    const user = await User.create(userObject)
    
    if(user) {
        res .status(201).json({ message: `Nuevo usuario ${email} creado`})
    } else {
        res.status(400).json({ message: 'Data invalida para crear usuario'})
    }
    
})

// @desc Update  user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async(req, res) => {
    const { id, email, roles, active, password } = req.body

    // Confirm data

    if (!id || !email || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'Todos los campos son requeridos' })
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({ message: 'Usuario no encontrado'})
    }

    //Duplicate
    const duplicate = await User.findOne({ email }).lean().exec()
    // Allow updates to original user
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Usuario duplicado'})
    }
    user.email = email
    user.roles = roles
    user.active = active

    if(password) {
        // Hash password
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.json({ message: `usuario ${updatedUser.email} actualizado`})
})

// @desc Delete user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async(req, res) => {
    const { id } = req.body

    if(!id) {
        return res.status(400).json({ message: 'El Id del usuario es requerido'})
    }

    const field = await Field.findOne({ user: id }).lean().exec()
    if(field?.length) {
        return res.status(400).json({ message: 'Este usuario tiene campos publicados '})
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({ message: 'Usuario no encontrado'})
    }

    const result = await user.deleteOne()

    const reply = `Usuario con email ${result.email} y ID ${result._id} eliminado`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
