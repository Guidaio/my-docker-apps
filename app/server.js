const express = require('express');
const { Client } = require('pg');

const app = express();

const client = new Client({
	host: 'db',
	port: 5432,
	user: 'postgres',
	password: 'mypassword',
	database: 'postgres'
});

client.connect();

const waitForDB = () => {
	client.query('SELECT 1', (err) => {
		if (err) {
			console.log('DB not ready, retrying...');
			setTimeout(waitForDB, 2000);
		} else {
			console.log('Connected to DB');
		}
	});
};

waitForDB();

client.query(`
	CREATE TABLE IF NOT EXISTS visits(
		id SERIAL PRIMARY KEY,
		visited_at TIMESTAMP DEFAULT NOW()
	)
`, (err) => {
	if (err) console.error('Error creating table:', err);
	else console.log('Table ready');
});

app.get('/', (req, res) => {
	client.query('INSERT INTO visits DEFAULT VALUES', (err)=> {
		if(err){
			res.send('<h1>Error inserting visit</h1><p>' + err.message + '</p>');
			return;
		}
		
		
		client.query('SELECT * FROM visits ORDER BY visited_at DESC', (err, result) => {
			if(err) {
				res.send('<h1>Error querying visits</h1><p>' + err.message + '</p>');
				return;
			}
			
			let html = '<h1>Visit History</h1><ul>';
			result.rows.forEach(row => {
				html += '<li>' + row.visited_at + '</li>';
			});
			html += '</ul><p>Total visits: ' + result.rows.length + '</p>';
			res.send(html);
		});
	});
});

app.listen(3000, () => {
	console.log('App listeninng on port 3000')
});