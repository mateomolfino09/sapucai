const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [{
        type: String,
        default: 'User'
    }],
    active: {
        type: Boolean,
        default: true
    },
    validEmail: { 
        type: String,
        default: false
    },
})

module.exports = mongoose.model('User', userSchema)