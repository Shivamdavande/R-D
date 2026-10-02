"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./middleware/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const siteRoutes_1 = __importDefault(require("./routes/siteRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const syncRoutes_1 = __importDefault(require("./routes/syncRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded receipt & site images
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads'), {
    maxAge: '7d',
    immutable: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        }
        else if (filePath.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
        }
        else {
            res.setHeader('Content-Type', 'image/jpeg');
        }
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
}));
// Root & Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        app: 'R2R – Raw to Refined Contractor Backend',
        timestamp: new Date().toISOString()
    });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/sites', siteRoutes_1.default);
app.use('/api/expenses', expenseRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/sync', syncRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/settings', settingsRoutes_1.default);
// Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
