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
    return res.render('categories/home');
});


app.get('/categories', async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM users");
    return res.render('categories/index', {
        users: rows
    });
});


app.get('/categories/form', async function (req: Request, res: Response) {
    try {
        return res.render('categories/form',{});
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});


app.post('/categories/add', async function (req: Request, res: Response) {
    const {nome} = req.body;
    if (!nome) {
        return res.status(400).send({ error: 'Nome é obrigatório' });
    }
    try {
        const result = await connection.query("SELECT * FROM categories WHERE name = (?)", [nome]);
        
        if (result[0][0]) {
            return res.status(400).json({ error: 'Já existe uma categoria com este nome' });

        }else{  
            await connection.query("INSERT INTO categories (name) VALUES (?)", [nome]);
            return res.status(200).send({ message: 'Categoria adicionada com sucesso' });
            
        }
       
      
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/categories/delete', async function (req: Request, res: Response) {
    const { id } = req.body;
    if (!id) {
        return res.status(400).send({ error: 'ID é obrigatório' });
    }
    try {
        await connection.query("DELETE FROM categories WHERE id = ?", [id]);
        return res.redirect("/categories");
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});





app.listen('3000', () => console.log("Server is listening on port http://localhost:3000 , http://localhost:8080"));