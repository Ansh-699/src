import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from "hono/jwt";

export const BlogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
        PrismaClient: any
    }
    variables: {
        userId: string;
    }
}>();

BlogRouter.use( '/*'  , async  (c, next) => {
    const authheader = c.req.header('Authorization') ||  "";
    const user = await verify(authheader, c.env.JWT_SECRET);
    if(user){
        c.set("jwtPayload", user);
        await next();
    }
    else{
        c.status(403);
        return c.json({ error: "Unauthorized" });
    }
});

BlogRouter.post('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const authorId = c.get("jwtPayload").id as string;

    await prisma.blog.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: authorId,
        }
    });

    return c.json({ message: "Blog created successfully" });
});

BlogRouter.put('/',  async (c) => {
    const body = await c.req.json();

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
    await prisma.blog.update({
        where : {
            id : "1"
        },
        data : {
            title : body.title,
            content : body.content
        }
    });

    return c.json({ message: "Blog updated successfully" });
});

BlogRouter.get('/:id', async (c) => {
    const id =  c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const blog = await prisma.blog.findFirst({
            where: {
                id: (id)
            }
        });
        return c.json(blog);
    }
    catch (e) {
        c.status(403);
        return c.json({ error: "error while fetching blog" });
    }
});

BlogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());
    
    const blogs = await prisma.blog.findMany();

    return c.json({blogs});
});