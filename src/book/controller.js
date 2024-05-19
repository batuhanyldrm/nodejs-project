const pool = require('../../repository')

const getBooks =  (req, res) => {
    pool.query(`SELECT
     id,
     name,
     average_score score
     FROM books`,
    (error, result) => {
        if (error) throw error;
        res.status(200).json(result.rows);
    })
}

const getBook = (req, res) => {
    const id = parseInt(req.params.id);
    
    pool.query(`
    SELECT AVG(score) AS average_score
    FROM book_history
    WHERE book_id = ${id}`,
    (error, result) => {
        if (error) {
            console.error("Error occurred while adding book:", error);
            res.status(500).send('Something Went Wrong');
        }
        
        const averageScore = result.rows[0].average_score;

        pool.query(`
        UPDATE books
        SET average_score = COALESCE(${averageScore}, -1)
        WHERE id = ${id}`,
        (error, result) => {
            if (error) {
                console.error("Error occurred while adding book:", error);
                res.status(500).send('Something Went Wrong');
            }

            pool.query(`
            SELECT id, name, COALESCE(average_score, -1) AS score
            FROM books WHERE id = ${id}`,
            (error, result) => {
                if (error) {
                    console.error("Error occurred while adding book:", error);
                    res.status(500).send('Something Went Wrong');
                }
                res.status(200).json(result.rows);
            });
        });
    });
};

const addBook =  (req, res) => {
    const { name } = req.body
    const query = 'INSERT INTO books (name) VALUES ($1)';
    const values = [name];
    pool.query(query, values,
    (error, result) => {
        if (error) {
            console.error("Error occurred while adding book:", error);
            res.status(500).send('Something Went Wrong');
        }
        res.status(201).send('Book Succesfully Created.');
        console.log("Book created")
    })
}

module.exports = {
    getBooks,
    getBook,
    addBook
}