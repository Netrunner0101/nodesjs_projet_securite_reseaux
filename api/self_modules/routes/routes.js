let express = require('express');
let router = express.Router();

let dataController = require('../../controllers/dataController');

router.post('/connection', dataController.connectUser)

router.get('/golden', dataController.getGoldenWall)
router.post('/golden', dataController.postGoldenWall)

module.exports = router;