const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const fieldSchema = new mongoose.Schema(
    {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    highlited: {
        type: Boolean,
        default: false
    }

},
{
    timestamps: true
}
)

fieldSchema.plugin(AutoIncrement, {
    inc_field: 'id',
    id: 'fieldNum',
    start_seq: 1
})

module.exports = mongoose.model('Field', fieldSchema)