import express from 'express';
import userRoutes from './routes/userRoutes';
import goalRoutes from './routes/goalRoutes';

const app = express();

app.use(express.json());

app.use('/users', userRoutes);
app.use('/goals', goalRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});
