const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const compress = require('koa-compress');
const http = require('http');
const statics = require('koa-static'); // 静态资源服务插件
const path = require('path'); // 路径管理
const socketHandle = require('./socket');
const router = require('./routes/index');
const { query } = require('./utils/db');
const koa2FallbackApiMiddleware = require('./middlewares/koa2FallbackApiMiddleware');

const app = new Koa();

app.use(compress()); // 网页压缩

const server = http.createServer(app.callback());
socketHandle(server);

// 去掉跨域限制
// app.use(cors());

// 去掉跨域限制
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200; 
  } else {
    
  }
  await next();
})

app.use(bodyParser()); // 接收并解析post请求的参数

console.log('server node env', process.env.NODE_ENV);

app.use(router.routes()).use(router.allowedMethods());

app.use(koa2FallbackApiMiddleware());

global.query = query;

// 配置静态资源
const staticPath = '../build';
app.use(statics(
  path.join(__dirname, staticPath)
));

server.listen(3000);

console.log('服务器已启动,端口3000');
