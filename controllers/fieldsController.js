const User = require('../models/User')
const Field = require('../models/Field')
//maneja try catch
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all fields
// @route GET /fields
// @access Private
const getAllFields = asyncHandler(async(req, res) => {
    const fields = await Field.find().lean()
    if(!fields?.length) {
        return res.status(400).json({ message: 'No se encontraron campos'})
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const fieldsWithUser = await Promise.all(fields.map(async (field) => {
        const user = await User.findById(field.user).lean().exec()
        return { ...field, email: user.email }
    }))

    res.json(fieldsWithUser)
})

// @desc Create new field
// @route POST /fields
// @access Private
const createNewField = asyncHandler(async(req, res) => {
    const { title, description, image_url, user } = req.body;

    // Confirm data
    if(!title || !description || !image_url || !user) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' })
    }

    // Check for duplicate
    const duplicate = await Field.findOne({ title, user }).lean().exec()
    if(duplicate) {
        return res.status(409).json({ message: 'Titulo de Campo duplicado' })
    }

    // Create and store new user
    const field = await Field.create({title, description, image_url, user})
    
    if(field) {
        res .status(201).json({ message: `Nuevo campo ${title} creado`})
    } else {
        res.status(400).json({ message: 'Data invalida para crear campo'})
    }
    
})

// @desc Update field
// @route PATCH /fields
// @access Private
const updateField = asyncHandler(async(req, res) => {
    const { id, title, description, image_url, user, roles } = req.body

    // Confirm data

    if (!id || !title || !user || !description || !image_url || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' })
    }

    const field = await Field.findById(id).exec()
    
    if(!field) {
        return res.status(400).json({ message: 'Campo no encontrado'})
    }

    if(field.user != user && !roles.includes('Admin')) {
        return res.status(400).json({ message: 'No tienes permisos para editar este campo'})
    }

    //Duplicate
    const duplicate = await Field.findOne({ title, user }).lean().exec()
    // Allow updates to original user
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Campo duplicado'})
    }

    field.title = title
    field.description = description
    field.image_url = image_url
    field.user = user

    const updatedField = await field.save()

    res.json({ message: `campo ${updatedField.title} actualizado`})
})

// @desc Delete field
// @route DELETE /fields
// @access Private
const deleteField = asyncHandler(async(req, res) => {
    const { id } = req.body

    if(!id) {
        return res.status(400).json({ message: 'El Id del campo es requerido'})
    }

    const field = await Field.findById(id).exec()

    if(!field) {
        return res.status(400).json({ message: 'Campo no encontrado'})
    }

    const result = await field.deleteOne()

    const reply = `Campo con titulo ${result.title} y ID ${result._id} eliminado`

    res.json(reply)
})

module.exports = {
    getAllFields,
    createNewField,
    updateField,
    deleteField
}
