import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3001);
const defaultDelayMs = Number(process.env.API_DELAY_MS ?? 0);

createApp({ defaultDelayMs }).listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
