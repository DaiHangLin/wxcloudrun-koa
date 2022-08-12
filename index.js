const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const server = require("koa-static");
const fs = require("fs");
const path = require("path");
const axios = require('axios')
const cloud = require('wx-server-sdk')
const { init: initDB, Counter, Calendar } = require("./db");

const router = new Router();
const client = axios.default

cloud.init({
  env: 'prod-3g6is4pwc7b28e19'
})

const homePage = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

// 首页
router.get("/", async (ctx) => {
  ctx.body = homePage;
});

// 更新计数
router.post("/api/count", async (ctx) => {
  const { request } = ctx;
  const { action } = request.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }

  ctx.body = {
    code: 0,
    data: await Counter.count(),
  };
});

// 获取计数
router.get("/api/count", async (ctx) => {
  const result = await Counter.findAll();

  ctx.body = {
    code: 0,
    data: result,
  };
});

// 日历事件获取
router.get("/api/calendar", async (ctx) => {
  const openId = ctx.request.headers["x-wx-openid"] || 'openId';
  const result = await Calendar.findAll({
    where: {
      openId,
    }
  });

  ctx.body = {
    code: 0,
    data: result,
  };
});

// 小程序调用，获取微信 Open ID
router.get("/api/wx_openid", async (ctx) => {
  if (ctx.request.headers["x-wx-source"]) {
    ctx.body = ctx.request.headers["x-wx-openid"];
  }
});

router.get("/api/push", async (ctx) => {
  const headers = ctx.headers
  const token = headers['x-wx-cloudbase-access-token']
  const weixinAPI = `https://api.weixin.qq.com/cgi-bin/message/custom/send?cloudbase_access_token=${token}`
  const payload = {
      touser: headers['x-wx-openid'],
      msgtype: 'text',
      text: {
          content: `云托管接收消息推送成功，内容如下：222`
      }
  }
  console.log('token', token,'openId', headers['x-wx-openid'])
  // dispatch to wx server
  const result = await client.post(weixinAPI, payload)
  console.log('received request', result)
  ctx.body = {
    code: 0,
    data: 'success'
  }
})


router.post("/api/push/v2", async (ctx) => {
  const headers = ctx.headers
  const { data, templateId } = ctx.body
  const reqData = data || {
    "name1": {
        "value": "339208499"
    },
    "thing3": {
        "value": "2015年01月05日"
    },
    "thing4": {
        "value": "TIT创意园"
    } ,
    "time13": {
        "value": "广州市新港中路397号"
    },
    "time14": {
        "value": "广州市新港中路397号"
    }
}
  const token = headers['x-wx-cloudbase-access-token']
  const weixinAPI = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?cloudbase_access_token=${token}`
  const payload = {
      touser: headers['x-wx-openid'],
      template_id: templateId || "o856LR7yt0zO4k8yCVlBpnABaQK2PqDw4jV9-PLFqUc",
      data: reqData,
  }
  console.log('token', token,'openId', headers['x-wx-openid'])
  // dispatch to wx server
  const result = await client.post(weixinAPI, payload)
  console.log('received request', result.data, ctx.body, cloud.openapi)
  ctx.body = {
    code: 0,
    data: 'success'
  }
})

const app = new Koa();
app
  .use(logger())
  .use(bodyParser())
  .use(server(path.join(__dirname)))
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 80;
async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}
bootstrap();
