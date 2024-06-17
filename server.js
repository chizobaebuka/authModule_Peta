import express from 'express';
import { connection } from './config/db.js';
import router from './routes/authRoutes.js';

const app = express();

connection();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', router );

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

export default app;

