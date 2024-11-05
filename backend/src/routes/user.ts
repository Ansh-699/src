import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'


const   UserRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string
		JWT_SECRET: string
        PrismaClient: any
        
	}
}>();;


UserRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: c.env.DATABASE_URL
            }
        }
    }).$extends(withAccelerate());
    const body = await c.req.json();
    try {
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password
            }
        });
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch(e) {
        console.error(e);
        if ((e as any).code === 'P2002' && (e as any).meta && (e as any).meta.target?.includes('email')) {
            c.status(409);
            return c.json({ error: "Email already exists" });
        }
        c.status(500);
        return c.json({ error: "Internal server error" });
    } finally {
        await prisma.$disconnect();
    }
})

UserRouter.post('/signin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const user = await prisma.user.findUnique({
		where: {
			email: body.email
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ jwt });
})

export { UserRouter }