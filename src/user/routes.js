const { Router } = require("express");
const controller = require('./controller')

const router = new Router()

router.get('/', controller.getUsers);
router.post('/', controller.addUser);
router.get('/:id', controller.getUser);
router.post('/:id/borrow/:bookId', controller.borrowBook);
router.post('/:id/return/:bookId', controller.returnBook);

module.exports = router;