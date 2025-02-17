const { Sequelize, DataTypes } = require("sequelize");

// 从环境变量中读取数据库配置
const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS = "" } = process.env;

const [host, port] = MYSQL_ADDRESS.split(":");

const sequelize = new Sequelize("nodejs_demo", MYSQL_USERNAME, MYSQL_PASSWORD, {
  host,
  port,
  dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
});

// 定义数据模型
const Counter = sequelize.define("Counter", {
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});


const Calendar = sequelize.define("CalendarEvent", {
  event: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  openId: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '',
  },
  color: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  }
}, {
  freezeTableName: true // Model tableName will be the same as the model name
});

// 数据库初始化方法
async function init() {
  await Counter.sync({alter: true});
  await Calendar.sync();
}

// 导出初始化方法和模型
module.exports = {
  init,
  Counter,
  Calendar,
};
