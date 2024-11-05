import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { UserRouter} from './routes/user'
import { BlogRouter } from './routes/blog'


const app = new Hono<{
	Bindings: {
		DATABASE_URL: string
		JWT_SECRET: string
	}
}>();

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route("/api/v1/", UserRouter );
app.route("/api/v1/blog", BlogRouter );






export default app;

