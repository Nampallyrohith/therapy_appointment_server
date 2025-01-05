import express, { Request, Response } from 'express';
import { connectAndQuery} from './service/db/client.js';

const app = express();

const PORT = 3001;

app.use(express.json());

// Default route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Express server!');
});

// Start the server after initializing tables
(async () => {
    try {
      await connectAndQuery() // Initialize the tables
 // Initialize the tables
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Failed to initialize tables or start the server:', error);
    }
  })();
