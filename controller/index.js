const mysql = require("mysql");

const conn = {
    host: 'localhost',
    database: 'uploadfile',
    user: 'root',
    password: ''
};

exports.getIndexPage = (req, res) => {
    res.render('index');
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

                res.status(200).send('File uploaded successfully');
                connection.release(); // Release the connection back to the pool
            });
        });
    });
};


    