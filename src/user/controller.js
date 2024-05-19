const pool = require('../../repository')

const getUsers =  (req, res) => {
    pool.query("SELECT id, name FROM users",
    (error, result) => {
        if (error) throw error;
        res.status(200).json(result.rows);
    })
}

const getUser = (req, res) => {
    const id = parseInt(req.params.id);
    pool.query(
        `SELECT 
        u.id,
        u.name,
        jsonb_build_object(
            'past', jsonb_agg(jsonb_build_object('name', b.name, 'userScore', bh.score)) FILTER (WHERE bh.status = 0),
            'present', jsonb_agg(jsonb_build_object('name', b.name)) FILTER (WHERE bh.status = 1)
        ) AS books
        FROM 
            users u
        LEFT JOIN 
            book_history bh ON u.id = bh.user_id
        LEFT JOIN 
            books b ON bh.book_id = b.id
        WHERE 
            u.id = $1
        GROUP BY 
            u.id, u.name`,
        [id],
        (error, result) => {
            if (error) {
                console.error('Something Went Wrong:', error);
                res.status(500).send('Something Went Wrong');
            }
            if (result.rows.length > 0) {
                result.rows[0].books.past = result.rows[0].books.past == null ? [] : result.rows[0].books.past
                result.rows[0].books.present = result.rows[0].books.present == null ? [] : result.rows[0].books.present
                res.status(200).json(result.rows);   
            }
        }
    );
};

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
    const checkBookHistoryQuery = 'SELECT 1 FROM book_history WHERE book_id = $1 AND status = $2';
    const insertBookHistoryQuery = 'INSERT INTO book_history (book_id, user_id, status) VALUES ($1, $2, $3)';

    pool.query(checkUserQuery, [id], (error, result) => {
        if (error) {
            return res.status(500).send('Something Went Wrong');
        }

        if (result.rowCount === 0) {
            return res.status(404).send('User not found');
        }

        pool.query(checkBookQuery, [bookId], (error, result) => {
            if (error) {
                return res.status(500).send('Something Went Wrong');
            }

            if (result.rowCount === 0) {
                return res.status(404).send('Book not found');
            }

            pool.query(checkBookHistoryQuery, [bookId, 1], (error, result) => {
                if (error) {
                    return res.status(500).send('Something Went Wrong');
                }

                if (result.rowCount > 0) {
                    return res.status(400).send('Book already borrowed');
                }

                pool.query(insertBookHistoryQuery, [bookId, id, 1], (error, result) => {
                    if (error) {
                        return res.status(500).send('Something Went Wrong');
                    }
                    res.status(201).send('Borrow book Successfully Created.');
                    console.log("Borrow book");
                });
            });
        });
    });
}

const returnBook = (req, res) => {
    const id = parseInt(req.params.id);
    const bookId = parseInt(req.params.bookId);
    const { score } = req.body;

    if (isNaN(id) || isNaN(bookId) || isNaN(score)) {
        res.status(400).send('Invalid parameters provided');
        return;
    }

    const checkBookStatusQuery = 'SELECT status FROM book_history WHERE book_id = $1 AND user_id = $2 AND status = $3 ORDER BY id';
    const insertBookHistoryQuery = 'UPDATE book_history SET score = $1, status = $2 WHERE book_id = $3 AND user_id = $4';
    const statusValues = [bookId, id, 1];
    const updateValues = [score, 0, bookId, id];

    pool.query(checkBookStatusQuery, statusValues, (error, result) => {
        if (error) {
            console.error("Error occurred while checking book status:", error);
            res.status(500).send('Something Went Wrong');
        } else {
            if (result.rows.length === 0) {
                res.status(404).send('Book or User not found.');
            } else {
                const status = result.rows[0].status;
                if (status !== 1) {
                    res.status(400).send('This book is in the library, you cannot enter score.');
                } else {
                    pool.query(insertBookHistoryQuery, updateValues, (error, result) => {
                        if (error) {
                            console.error("Error occurred while updating book history:", error);
                            res.status(500).send('Something Went Wrong');
                        } else {
                            if (result.rowCount > 0) {
                                res.status(201).send('Book Delivered.');
                                console.log("Book Delivered");
                            } else {
                                res.status(404).send('Book or User not found.');
                            }
                        }
                    });
                }
            }
        }
    });
};


module.exports = {
    getUsers,
    getUser,
    addUser,
    borrowBook,
    returnBook
}