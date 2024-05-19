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
    const { name, books } = req.body
    const query = 'INSERT INTO users (name, books) VALUES ($1, $2)';
    const values = [name, books];
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
    const insertBookHistoryQuery = 'INSERT INTO book_history (book_id) VALUES ($1)';

    pool.query(checkUserQuery, [id], (error, result) => {
        if (error) {
            console.error("Error occurred while checking user:", error);
            return res.status(500).send('Something Went Wrong');
        }

        if (result.rowCount === 0) {
            return res.status(404).send('User not found');
        }

        pool.query(checkBookQuery, [bookId], (error, result) => {
            if (error) {
                console.error("Error occurred while checking book:", error);
                return res.status(500).send('Something Went Wrong');
            }

            if (result.rowCount === 0) {
                return res.status(404).send('Book not found');
            }

            pool.query(insertBookHistoryQuery, [bookId], (error, result) => {
                if (error) {
                    console.error("Error occurred while adding borrow book:", error);
                    return res.status(500).send('Something Went Wrong');
                }
                res.status(201).send('Borrow book Successfully Created.');
                console.log("Borrow book");
            });
        });
    });
}

module.exports = {
    getUsers,
    getUser,
    addUser,
    borrowBook
}