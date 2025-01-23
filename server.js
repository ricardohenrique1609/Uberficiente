const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');  // Importando o bcrypt
const jwt = require('jsonwebtoken');

// Middleware para autenticação JWT
function authenticateJWT(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, 'secreta_chave', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido.' });
        }

        req.user = user; // Salva os dados do usuário no objeto `req`
        next();
    });
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin', // Substitua pela sua senha do MySQL
    database: 'uber' // Substitua pelo seu banco de dados
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Banco de dados conectado.');
    }
});

// Rota de registro de usuário
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao criptografar a senha' });
        }

        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (error, results) => {
            if (error) {
                console.error('Erro ao registrar o usuário:', error.message);
                return res.status(500).json({ message: 'Erro ao registrar o usuário: ' + error.message });
            }
            res.json({ message: 'Usuário registrado com sucesso!' });
        });
    });
});

// Rota de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Erro ao conectar ao servidor.' });
        }

        if (results.length > 0) {
            const user = results[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ message: 'Erro ao verificar a senha' });
                }

                if (isMatch) {
                    const token = jwt.sign({ user_id: user.id }, 'secreta_chave', { expiresIn: '1h' });
                    res.status(200).json({ message: 'Login bem-sucedido!', token });
                } else {
                    res.status(401).json({ message: 'Usuário ou senha incorretos.' });
                }
            });
        } else {
            res.status(401).json({ message: 'Usuário não encontrado.' });
        }
    });
});

// Rota para armazenar solicitação de corrida
app.post('/api/rides', (req, res) => {
    const { user_id, pickup_location, dropoff_location, price } = req.body;

    const query = 'INSERT INTO Rides (user_id, pickup_location, dropoff_location, price) VALUES (?, ?, ?, ?)';
    db.query(query, [user_id, pickup_location, dropoff_location, price], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao inserir os dados no banco de dados.' });
        }
        res.status(201).json({ message: 'Corrida cadastrada com sucesso!', id: result.insertId });
    });
});

// Rota para salvar reservas
app.post('/api/reservas', (req, res) => {
    const { pickup, dropoff, price } = req.body;

    const sql = 'INSERT INTO reservas (pickup, dropoff, price, created_at) VALUES (?, ?, ?, NOW())';
    db.query(sql, [pickup, dropoff, price], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao salvar a reserva.' });
        }

        res.status(201).json({ message: 'Reserva criada com sucesso!', pickup, dropoff, price });
    });
});

// Rota para buscar a última reserva
app.get('/api/reservas', (req, res) => {
    const query = 'SELECT * FROM reservas ORDER BY created_at DESC LIMIT 1';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar reservas:', err);
            return res.status(500).send('Erro ao buscar reservas.');
        }
        res.json(results[0]);
    });
});

// Rota para registrar cartão de crédito
app.post('/register-card', (req, res) => {
    const { card_number, card_holder, expiry_date, cvv } = req.body;

    if (!card_number || !card_holder || !expiry_date || !cvv) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }

    bcrypt.hash(cvv, 10, (err, hashedCVV) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao criptografar o CVV' });
        }

        const query = 'INSERT INTO cards (card_number, card_holder, expiry_date, cvv) VALUES (?, ?, ?, ?)';
        db.query(query, [card_number, card_holder, expiry_date, hashedCVV], (error, results) => {
            if (error) {
                console.error('Erro ao registrar o cartão:', error.message);
                return res.status(500).json({ message: 'Erro ao registrar o cartão: ' + error.message });
            }
            res.status(200).json({ message: 'Cartão registrado com sucesso!' });
        });
    });
});

// Rota para buscar perfil do usuário e corridas
// Rota para buscar perfil do usuário e corridas

// Rota para buscar perfil do usuário e informações relacionadas
app.get('/api/profile/:user_id', (req, res) => {
    const userId = req.params.user_id;

    const queryUser = `
        SELECT 
            users.id AS user_id, users.username, users.email, users.profile_picture,
            rides.id AS ride_id, rides.pickup_location, rides.dropoff_location, rides.price AS ride_price, rides.created_at AS ride_created_at,
            reservas.id AS reserva_id, reservas.pickup AS reserva_pickup, reservas.dropoff AS reserva_dropoff, reservas.price AS reserva_price, reservas.created_at AS reserva_created_at,
            cards.id AS card_id, cards.card_number, cards.card_holder, cards.expiry_date, cards.cvv
        FROM users
        LEFT JOIN rides ON users.id = rides.user_id
        LEFT JOIN reservas ON users.id = reservas.user_id
        LEFT JOIN cards ON users.id = cards.user_id
        WHERE users.id = ?;
    `;

    db.query(queryUser, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ message: 'Erro ao buscar o usuário.', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Montar o objeto do perfil
        const userData = {
            user: {
                username: results[0].username,
                email: results[0].email,
                profile_picture: results[0].profile_picture
            },
            rides: [],
            cards: [],
            reservas: []
        };

        // Agrupar os dados
        results.forEach(result => {
            if (result.ride_id) {
                userData.rides.push({
                    ride_id: result.ride_id,
                    pickup_location: result.pickup_location,
                    dropoff_location: result.dropoff_location,
                    ride_price: result.ride_price,
                    ride_created_at: result.ride_created_at
                });
            }
            if (result.card_id) {
                userData.cards.push({
                    card_id: result.card_id,
                    card_number: result.card_number,
                    card_holder: result.card_holder,
                    expiry_date: result.expiry_date,
                    cvv: result.cvv
                });
            }
            if (result.reserva_id) {
                userData.reservas.push({
                    reserva_id: result.reserva_id,
                    reserva_pickup: result.reserva_pickup,
                    reserva_dropoff: result.reserva_dropoff,
                    reserva_price: result.reserva_price,
                    reserva_created_at: result.reserva_created_at
                });
            }
        });

        res.json(userData);
    });
});



app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
