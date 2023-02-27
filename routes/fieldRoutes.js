const express = require('express')
const router = express.Router();
const fieldsController = require('../controllers/fieldsController')

router.route('/')
    .get(fieldsController.getAllFields)
    .post(fieldsController.createNewField)
    .patch(fieldsController.updateField)
    .delete(fieldsController.deleteField)
    
module.exports = router