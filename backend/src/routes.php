<?php

use App\Controllers\Admin\AdminAuthController;
use App\Controllers\Admin\CouponController as AdminCouponController;
use App\Controllers\Admin\CustomerController;
use App\Controllers\Admin\DashboardController;
use App\Controllers\Admin\PricingController;
use App\Controllers\Admin\ProductController;
use App\Controllers\Admin\ProviderController as AdminProviderController;
use App\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Controllers\AirtimeController;
use App\Controllers\AuthController;
use App\Controllers\DataController;
use App\Controllers\ElectricityController;
use App\Controllers\PaystackWebhookController;
use App\Controllers\StatementController;
use App\Controllers\TransactionController;
use App\Controllers\WalletController;
use App\Core\Request;
use App\Core\Router;
use App\Middleware\AdminMiddleware;
use App\Middleware\AuthMiddleware;

/** @var Router $router */

$authMw = new AuthMiddleware();
$adminMw = new AdminMiddleware();

// ---------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------
$router->get('/api/v1/health', function (Request $r) {
    \App\Core\Response::success(['status' => 'ok', 'time' => gmdate('c')]);
});

// ---------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------
$auth = new AuthController();
$router->post('/api/v1/auth/register', [$auth, 'register']);
$router->post('/api/v1/auth/verify-otp', [$auth, 'verifyOtp']);
$router->post('/api/v1/auth/resend-otp', [$auth, 'resendOtp']);
$router->post('/api/v1/auth/login', [$auth, 'login']);
$router->post('/api/v1/auth/forgot-password', [$auth, 'forgotPassword']);
$router->post('/api/v1/auth/reset-password', [$auth, 'resetPassword']);
$router->post('/api/v1/auth/logout', [$auth, 'logout']);
$router->get('/api/v1/auth/me', [$auth, 'me'], [$authMw]);

// ---------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------
$wallet = new WalletController();
$router->get('/api/v1/wallet', [$wallet, 'show'], [$authMw]);
$router->post('/api/v1/wallet/fund', [$wallet, 'fund'], [$authMw]);
$router->post('/api/v1/wallet/fund/initialize', [$wallet, 'initializeFunding'], [$authMw]);


// Paystack calls this directly — no user JWT (it's authenticated via the
// x-paystack-signature header instead, verified inside the controller).
$paystackWebhook = new PaystackWebhookController();
$router->post('/api/v1/webhooks/paystack', [$paystackWebhook, 'handle']);

// ---------------------------------------------------------------------
// Services — Airtime, Data, Electricity (ePINs-backed)
// ---------------------------------------------------------------------
$airtime = new AirtimeController();
$router->get('/api/v1/services/airtime/providers', [$airtime, 'providers']);
$router->post('/api/v1/services/airtime/purchase', [$airtime, 'purchase'], [$authMw]);

$dataCtrl = new DataController();
$router->get('/api/v1/services/data/providers', [$dataCtrl, 'providers']);
$router->get('/api/v1/services/data/plans', [$dataCtrl, 'plans']);
$router->post('/api/v1/services/data/purchase', [$dataCtrl, 'purchase'], [$authMw]);

$electricity = new ElectricityController();
$router->get('/api/v1/services/electricity/providers', [$electricity, 'providers']);
$router->post('/api/v1/services/electricity/lookup', [$electricity, 'lookupMeter'], [$authMw]);
$router->post('/api/v1/services/electricity/purchase', [$electricity, 'purchase'], [$authMw]);

// ---------------------------------------------------------------------
// Transactions & Statement
// ---------------------------------------------------------------------
$transactions = new TransactionController();
$router->get('/api/v1/transactions', [$transactions, 'index'], [$authMw]);
$router->get('/api/v1/transactions/summary', [$transactions, 'summary'], [$authMw]);
$router->get('/api/v1/transactions/{id}', [$transactions, 'show'], [$authMw]);

$statement = new StatementController();
$router->get('/api/v1/statement.csv', [$statement, 'csv'], [$authMw]);

// ---------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------
$adminAuth = new AdminAuthController();
$router->post('/api/v1/admin/auth/login', [$adminAuth, 'login']);
$router->get('/api/v1/admin/auth/me', [$adminAuth, 'me'], [$adminMw]);

$dashboard = new DashboardController();
$router->get('/api/v1/admin/dashboard/stats', [$dashboard, 'stats'], [$adminMw]);
$router->get('/api/v1/admin/dashboard/revenue-trend', [$dashboard, 'revenueTrend'], [$adminMw]);
$router->get('/api/v1/admin/dashboard/top-services', [$dashboard, 'topServices'], [$adminMw]);

$customers = new CustomerController();
$router->get('/api/v1/admin/customers', [$customers, 'index'], [$adminMw]);
$router->get('/api/v1/admin/customers/{id}', [$customers, 'show'], [$adminMw]);
$router->post('/api/v1/admin/customers/{id}/suspend', [$customers, 'suspend'], [$adminMw]);
$router->post('/api/v1/admin/customers/{id}/reactivate', [$customers, 'reactivate'], [$adminMw]);

$adminTxns = new AdminTransactionController();
$router->get('/api/v1/admin/transactions', [$adminTxns, 'index'], [$adminMw]);

$products = new ProductController();
$router->get('/api/v1/admin/products', [$products, 'index'], [$adminMw]);
$router->post('/api/v1/admin/products/{id}/toggle-status', [$products, 'toggleStatus'], [$adminMw]);

$pricing = new PricingController();
$router->get('/api/v1/admin/pricing', [$pricing, 'index'], [$adminMw]);
$router->put('/api/v1/admin/pricing/{id}', [$pricing, 'update'], [$adminMw]);

$adminProviders = new AdminProviderController();
$router->get('/api/v1/admin/providers', [$adminProviders, 'index'], [$adminMw]);
$router->get('/api/v1/admin/providers/epins-status', [$adminProviders, 'epinsStatus'], [$adminMw]);

$coupons = new AdminCouponController();
$router->get('/api/v1/admin/coupons', [$coupons, 'index'], [$adminMw]);
$router->post('/api/v1/admin/coupons', [$coupons, 'store'], [$adminMw]);
