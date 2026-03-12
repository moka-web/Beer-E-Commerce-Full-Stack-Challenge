import app from "./src/app.js";
import { seedUsers } from "./src/data/users.js";

const PORT = process.env.PORT || 3001;

seedUsers().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
});
