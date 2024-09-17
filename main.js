const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql');
// Create a connection to the database
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'testdb'
})
//CREATE DATABASE IF NOT EXISTS `testdb`;
// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database');
})
module.exports = connection;
function createDB(createStatements){
    for (statement of createStatements){
        console.log(statement)
        connection.query(statement, (err,results,fields) => {
            if (err) {
                console.error('Error executing query:', err.message)
                return
              }
            else if(statement.includes("CREATE TABLE")){
                console.log("Table created")
            }
        })
    }

}
const table1Init = `
CREATE TABLE IF NOT EXISTS \`testdb\`.\`Users\`(
\`id\` CHAR(36) NOT NULL PRIMARY KEY,
\`fName\` VARCHAR(255),
\`lName\` VARCHAR(255)
);`
const table2Init =` 
CREATE TABLE IF NOT EXISTS \`testdb\`.\`Accounts\`(
\`id\` CHAR(36) NOT NULL PRIMARY KEY,
\`balance\` INT NOT NULL,
\`type\` VARCHAR(255)
);
  `
createDB([table1Init,table2Init])
app.use(express.json())
//----------------------
function deleteSQL(table, req, callback){
    sql = `DELETE FROM \`${table}\`WHERE \`id\` = "${req.params.id}"`
    connection.query(sql, (err, results, fields) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return;
        }
            callback(results)
        })
}
function selectSQL(fields,table,req=false,callback){
    sql = `SELECT ${fields} FROM \`${table}\``
    if (req){ // Request is only sent in when getting data by value
        sql += `WHERE \`id\` = "${req.params.id}";`
    }
    else{sql += ';'}
    console.log(sql)
    connection.query(sql, (err, results, fields) => {
    if (err) {
        console.error('Error executing query:', err.message);
        return;
    }
        callback(results)
    })
}
function insertData(req,res,type){
    if (typeof req.body == "object"){
        if (type == "Accounts"){
            var tableName = type
        }
        if (type == "Users"){
            var tableName = type
        }
        const data = req.body
        const keys = Object.keys(data)
        const values = Object.values(data)
        const columns = keys.join(', ') //"id" : "1234", "fName" : "Shawn", "lName" : "Valdez" = ["id","fName","lName"]
        const placeholders = keys.map(() => '?').join(', ') // Maps a ? for each key in the json
        const sql = `INSERT INTO \`testdb\`.\`${tableName}\` (${columns}) VALUES (${placeholders})`
        // 'INSERT INTO `Users` (id, fName, lName) VALUES (?, ?, ?)'
        connection.query(sql, values, err => {
            if (err) {
                console.error('Error executing query:', err.message)
            } else {
                console.log('Data inserted successfully:')
                res.status(201).send(JSON.stringify({ id: req.body.id }));
            }
        })
    
    }
}
function checkCurrentColumns(req,table,callback){
    sql = `SHOW COLUMNS FROM \`${table}\`;`
    keys = Object.keys(req.body)
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving columns:', err.message)
            callback(false)
            return
        }
        columns = results.map(row => row.Field)
        for(key of keys){
            if (!columns.includes(key)){
                console.log('Columns:', columns, ' in database')
                console.log('Key not found:', key)
                callback(false) // Key not found return false via callback
                return
            }
        }
        console.log("All keys exist in the columns.")
        callback(columns)
    })
}
function updateSQL(req,table){
    checkCurrentColumns(req, table, (result)=>{
        if (result) { // result is the columns that currently exist in the database
            console.log(`All keys exist in the ${table} table.`)
            sql = `UPDATE \`${table}\` SET `
            setParts = []
            for(column of Object.keys(req.body)){
                setParts.push(`\`${column}\` = ?`)
            }
            sql += setParts.join(", ")
            console.log(req.params.id)
            sql += ` WHERE \`id\`= '${req.params.id}';`
            console.log(sql)
            connection.query(sql, Object.values(req.body),(err, results) => {
                if (err) {
                    console.error('Error executing query:', err.message);
                    return;
                }
                console.log('Update successful:', results);
            })
            }
         else {
            console.log(`Some keys are missing from the ${table} table.`)
            // Handle the error case
        }
    
    })
}
app.get('/user', (req, res) => {        // Get All Users
    selectSQL('*','Users', (results) => {
        res.status(201).send(results)
    })
})
app.get('/account', (req, res) => {     // Get All Accounts
    selectSQL('*','Accounts', (results) => {
        res.status(201).send(results);
    })
})
app.post('/user', (req, res) => {       // Add One User
    console.log(`User\n${JSON.stringify(req.body)}`)
    insertData(req, res, "Users")
})
app.post('/account', (req, res) => {    // Get One Account
    console.log(`User\n${JSON.stringify(req.body)}`)
    insertData(req, res, "Accounts")
})
app.get('/user/:id', (req, res) => {    // Get One User by ID
    selectSQL("*","Users", req, (results) => {
        if (results.length === 0){ // results is returned as an empty array if it fails to find
            res.status(404).send({ message: "User not found" });
            return
        }
        res.status(201).send(results)
    })
})
app.get('/account/:id', (req, res) => { // Get One Account by ID
    selectSQL("*","Accounts", req, (results) => {
        if (results.length == 0){ // results is returned as an empty array if it fails to find
            res.status(404).send({ message: "User not found" });
            return
        }
        res.status(201).send(results)
    })
})
app.delete('/user/:id', (req, res) => {     // Del One User by ID
    deleteSQL("Users",req,  (results) => {
        if (results.affectedRows <= 0){ // results is returned as an empty array if it fails to find
            res.status(404).send({message: "User not found" });
            console.log(`Delete: (${req.params.id}) unsuccessful`)
            return
        }
        res.status(200).send({message :"User Deleted"})
        console.log(`${JSON.stringify(req.params)} Deleted`)
    })
})
app.delete('/account/:id', (req, res) => {  // Del One Account by ID
    deleteSQL("Accounts",req,  (results) => {
        if (results.affectedRows <= 0){ // results is returned as an empty array if it fails to find
            res.status(404).send({ message: "User not found" });
            console.log(`Delete: (${req.params.id}) unsuccessful`)
            return
        }
        res.status(204).send({message :"Account Deleted"})
        console.log(`${JSON.stringify(req.params)} Deleted`)
    })
})
app.patch('/user/:id/edit', (req, res) => { // Update One User by ID
    if(Object.keys(req.body).length === 0){
        res.send({message: "No Changes"})
    }
    else if("iwd" in req.body){
        res.send({message: "ID is immutable"})
    }
    else{
        updateSQL(req, "Users")
        res.send(req.body)
    }
    
    //updateData( )//remember to prevent ID updates on serverside
})
app.patch('/account/:id/edit', (req, res) => { // Update One User by ID
    if(Object.keys(req.body).length === 0){
        res.send({message: "No Changes"})
    }
    else if("iad" in req.body){
        res.send({message: "ID is immutable"})
    }
    else{
        updateSQL(req, "Accounts")
        res.send(req.body)
    }
    
    //updateData( )//remember to prevent ID updates on serverside
})
app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})

