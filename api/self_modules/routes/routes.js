let express = require('express');
let router = express.Router();

let dataController = require('../../controllers/dataController');

router.post('/connection', dataController.connectUser)

// TODO: remove before production - debug route for testing
router.get('/debug-login', dataController.debugAccess)

module.exports = router;