const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const server = require("koa-static");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");

const router = new Router();

const homePage = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

// 首页
router.get("/", async (ctx) => {
  ctx.body = homePage;
});

const app = new Koa();
app
  .use(logger())
  .use(bodyParser())
  .use(server(path.join(__dirname)))
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 1230;
async function bootstrap() {
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}
bootstrap();
