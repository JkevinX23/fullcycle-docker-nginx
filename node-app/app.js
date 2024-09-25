const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 3000;

const config = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(config);

  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ', err);
      setTimeout(handleDisconnect, 2000); // Tenta se reconectar após 2 segundos
    } else {
      console.log('Connected to MySQL');
    }
  });

  connection.on('error', function(err) {
    console.error('MySQL error: ', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // Reconecta em caso de desconexão
    } else {
      throw err;
    }
  });
}

handleDisconnect();

// Criação da tabela 'people'
connection.query(`CREATE TABLE IF NOT EXISTS people (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(255), PRIMARY KEY(id));`);

app.get('/', (req, res) => {
  const name = `User ${Math.floor(Math.random() * 1000)}`;
  connection.query(`INSERT INTO people(name) values('${name}')`);

  connection.query('SELECT name FROM people', (err, results) => {
    if (err) throw err;
    let namesList = results.map(row => `<li>${row.name}</li>`).join('');
    res.send(`<h1>Full Cycle Rocks!</h1><ul>${namesList}</ul>`);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
