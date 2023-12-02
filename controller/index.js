const mysql = require("mysql");

const conn = {
    host: 'localhost',
    database: 'uploadfile',
    user: 'root',
    password: ''
};

exports.getIndexPage = (req, res) => {
    const sql = `SELECT id, filename, filepath FROM files`;
    
    const connection = mysql.createPool(conn);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Error getting MySQL connection');
            return;
        }

        connection.query(sql, (error, results) => {
            if (error) {
                console.error('Error executing SQL query:', error);
                res.status(500).send('Error executing SQL query');
                return;
            }

            // Release the connection back to the pool
            connection.release();

            // Pass the fetched data to the 'index' view for rendering
            res.render('index', { files: results }); // Assuming 'files' is the key to access the fetched data in the view
        });
    });
};

const fs = require('fs');
const path = require('path');

exports.uploadfile = (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded');
        return;
    }

    const connection = mysql.createPool(conn);

    const originalFileName = req.file.originalname; // Get the original file name
    const filePath = req.file.path; // Assuming this is the path to the uploaded file

    const fileStream = fs.createReadStream(filePath); // Create a readable stream for the file

    let fileData = [];

    fileStream.on('data', (chunk) => {
        fileData.push(chunk);
    });

    fileStream.on('end', () => {
        fileData = Buffer.concat(fileData); // Concatenate all chunks into a single buffer

        connection.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Error getting MySQL connection');
                return;
            }

            const sql = 'INSERT INTO files (filename, filepath) VALUES (?, ?)';

            connection.query(sql, [originalFileName, filePath], (error, results) => {
                if (error) {
                    console.error('Error inserting file data:', error);
                    res.status(500).send('Error inserting file data');
                    return;
                }
                res.render('index');
                // res.status(200).send('File uploaded successfully');
                connection.release(); // Release the connection back to the pool
            });
        });
    });
};

exports.downloadfile = (req, res) => {
    console.log(req.params)
    const { fileid } = req.params;
    const sql = 'SELECT filepath, filename FROM files WHERE id = ?';

    const connection = mysql.createPool(conn);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Error getting MySQL connection');
            return;
        }

        connection.query(sql, [fileid], (error, results) => {
            console.log(results);
            if (error) {
                console.error('Error executing SQL query:', error);
                res.status(500).send('Error executing SQL query');
                return;
            }

            if (results.length === 0) {
                res.status(404).send('File not found');
                return;
            }

            const file = results[0];
            const filePath = file.filepath;
            const fileName = file.filename;

            // Serve the file for download
            res.download(filePath, fileName, (downloadErr) => {
                if (downloadErr) {
                    console.error('Error downloading file:', downloadErr);
                    res.status(500).send('Error downloading file');
                }
            });

            connection.release();
        });
    });
};

exports.updateFile = (req,res) => {
    
}