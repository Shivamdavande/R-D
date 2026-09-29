"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const startServer = async () => {
    await (0, db_1.connectDB)();
    app_1.default.listen(env_1.config.port, () => {
        console.log(`=======================================================`);
        console.log(` 🚀 R2R Contractor Backend API Server Running`);
        console.log(` 📍 PORT: ${env_1.config.port}`);
        console.log(` 🌐 ENV: ${env_1.config.nodeEnv}`);
        console.log(` 🏷️  COMPANY: ${env_1.config.companyName}`);
        console.log(`=======================================================`);
    });
};
startServer();
