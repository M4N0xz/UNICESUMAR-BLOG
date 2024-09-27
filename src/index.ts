import express, {Request, Response} from "express";
import mysql from "mysql2/promise";

const app = express();

// Configura EJS como a engine de renderização de templates
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});

// Middleware para permitir dados no formato JSON
app.use(express.json());
// Middleware para permitir dados no formato URLENCODED
app.use(express.urlencoded({ extended: true }));


app.get('/', function (req: Request, res: Response) {
    return res.render('users/inicio');
});


app.get('/users', async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM usuarios");
    return res.render('users/index', {
        users: rows
    });
});


app.get('/users/form', async function (req: Request, res: Response) {
    try {
        return res.render('users/form',{});
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});


app.post('/users', async function (req: Request, res: Response) {
    const { nome, email, senha, papel, ativo } = req.body;
   //recarrega o formulario caso algum valor esteja faltando
    if (!nome || !email || !senha || !papel || ativo === undefined) {
        return res.redirect("/users/form");
    }
    try {
        await connection.query("INSERT INTO usuarios (nome, email, senha, papel, ativo) VALUES (?, ?, ?, ?, ?)", [nome, email, senha, papel, ativo ? 1 : 0]);
        return res.redirect("/users");
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/users/:id/delete', async function (req: Request, res: Response) {
    const id = req.params.id;
    try {
        await connection.query("DELETE FROM usuarios WHERE id = (?)", [id]);
        return res.redirect("/users");
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
    
});

app.get('/login', async function (req: Request, res: Response) {
    try {
        return res.render('users/login',{});
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});


app.post('/login', async function (req: Request, res: Response) {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.redirect('/login');
    }
    try {
        const [rows] = await connection.query("SELECT * FROM usuarios WHERE email = (?) AND senha = (?)", [email, senha]);
        if (!rows[0]) {
            return res.redirect("/login");
        }
        return res.redirect("/users");
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});



app.listen('3000', () => console.log("Server is listening on port http://localhost:3000 , http://localhost:8080"));