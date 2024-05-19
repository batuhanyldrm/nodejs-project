const { Router } = require("express");
const controller = require('./controller')

const router = new Router()

router.get('/', controller.getBooks);
router.post('/', controller.addBook);
router.get('/:id', controller.getBook);

module.exports = router;