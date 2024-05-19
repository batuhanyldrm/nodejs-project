const pool = require('../../repository')

const getUsers =  (req, res) => {
    pool.query("SELECT id, name FROM users",
    (error, result) => {
        if (error) throw error;
        res.status(200).json(result.rows);
    })
}

const getUser =  (req, res) => {
    const id = parseInt(req.params.id)
    pool.query(`SELECT * FROM users WHERE id = ${id}`,
    (error, result) => {
        if (error) throw error;
        res.status(200).json(result.rows);
    })
}

const addUser =  (req, res) => {
    const { name } = req.body
    const query = 'INSERT INTO users (name) VALUES ($1)';
    const values = [name];
    pool.query(query, values,
    (error, result) => {
        if (error) {
            console.error("Error occurred while adding user:", error);
            res.status(500).send('Something Went Wrong');
        }
        res.status(201).send('User Succesfully Created.');
        console.log("User created")
    })
}

const borrowBook =  (req, res) => {
    const id = parseInt(req.params.id)
    const bookId = parseInt(req.params.bookId);

    const checkUserQuery = 'SELECT 1 FROM users WHERE id = $1';
    const checkBookQuery = 'SELECT 1 FROM books WHERE id = $1';
    const checkBookHistoryQuery = 'SELECT 1 FROM book_history WHERE status = $1';
    const insertBookHistoryQuery = 'INSERT INTO book_history (book_id, user_id, status) VALUES ($1, $2, $3)';

    pool.query(checkUserQuery, [id], (error, result) => {
        if (error) {
            console.error("Error occurred while checking user:", error);
            return res.status(500).send('Something Went Wrong');
        }

        if (result.rowCount === 0) {
            return res.status(404).send('User not found');
        }

        pool.query(checkBookHistoryQuery, [1], (error, result) => {
            if (error) {
                console.error("Error occurred while checking user:", error);
                return res.status(500).send('Something Went Wrong');
            }
    
            for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].status === 1) {
                    return res.status(404).send('Book already borrowed');
                }
            }

            pool.query(checkBookQuery, [bookId], (error, result) => {
                if (error) {
                    console.error("Error occurred while checking book:", error);
                    return res.status(500).send('Something Went Wrong');
                }

                if (result.rowCount === 0) {
                    return res.status(404).send('Book not found');
                }

                pool.query(insertBookHistoryQuery, [bookId, id, 1], (error, result) => {
                    if (error) {
                        console.error("Error occurred while adding borrow book:", error);
                        return res.status(500).send('Something Went Wrong');
                    }
                    res.status(201).send('Borrow book Successfully Created.');
                    console.log("Borrow book");
                });
            });
        });
    });
}

const returnBook =  (req, res) => {
    const id = parseInt(req.params.id)
    const bookId = parseInt(req.params.bookId);
    const { score } = req.body

    const insertBookHistoryQuery = 'UPDATE book_history SET score = $1, status = $2 WHERE book_id = $3 AND user_id = $4';
    const values = [score, null, bookId, id];
    pool.query(insertBookHistoryQuery, values,
    (error, result) => {
        if (error) {
            console.error("Error occurred while adding user:", error);
            res.status(500).send('Something Went Wrong');
        }
        res.status(201).send('Book Delivered.');
        console.log("Book Delivered")
    })
}

module.exports = {
    getUsers,
    getUser,
    addUser,
    borrowBook,
    returnBook
}