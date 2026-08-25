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
use App\Controllers\Admin\ReferralProgramController;
use App\Controllers\ReferralController;
use App\Controllers\Admin\ActivityLogController;
use App\Controllers\Admin\BlogController as AdminBlogController;
use App\Controllers\BlogController;
use App\Controllers\NotificationController;
use App\Controllers\PushController;
use App\Controllers\SecurityController;
use App\Controllers\Admin\NavItemController;


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
$router->post('/api/v1/auth/verify-login-otp', [$auth, 'verifyLoginOtp']);

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

$referrals = new ReferralController();
$router->get('/api/v1/referrals/summary', [$referrals, 'summary'], [$authMw]);
$router->get('/api/v1/referrals/history', [$referrals, 'history'], [$authMw]);

$statement = new StatementController();
$router->get('/api/v1/statement.csv', [$statement, 'csv'], [$authMw]);

$blog = new BlogController();
$router->get('/api/v1/blog', [$blog, 'index']);
$router->get('/api/v1/blog/{slug}', [$blog, 'show']);


$notifications = new NotificationController();
$router->get('/api/v1/notifications', [$notifications, 'index'], [$authMw]);
$router->get('/api/v1/notifications/unread-count', [$notifications, 'unreadCount'], [$authMw]);
$router->post('/api/v1/notifications/{id}/read', [$notifications, 'markRead'], [$authMw]);
$router->post('/api/v1/notifications/read-all', [$notifications, 'markAllRead'], [$authMw]);

$push = new PushController();
$router->get('/api/v1/push/vapid-public-key', [$push, 'vapidPublicKey']);
$router->post('/api/v1/push/subscribe', [$push, 'subscribe'], [$authMw]);
$router->post('/api/v1/push/unsubscribe', [$push, 'unsubscribe'], [$authMw]);


$security = new SecurityController();
$router->post('/api/v1/security/change-password', [$security, 'changePassword'], [$authMw]);
$router->post('/api/v1/security/transaction-pin', [$security, 'setTransactionPin'], [$authMw]);
$router->post('/api/v1/security/transaction-pin/verify', [$security, 'verifyTransactionPin'], [$authMw]);
$router->post('/api/v1/security/two-factor', [$security, 'setTwoFactor'], [$authMw]);

// ---------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------
$adminAuth = new AdminAuthController();
$router->post('/api/v1/admin/auth/login', [$adminAuth, 'login']);
$router->get('/api/v1/admin/auth/me', [$adminAuth, 'me'], [$adminMw]);

$referralProgram = new ReferralProgramController();
$router->get('/api/v1/admin/referral-program', [$referralProgram, 'overview'], [$adminMw]);
$router->put('/api/v1/admin/referral-program/settings', [$referralProgram, 'updateSettings'], [$adminMw]);

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
$router->post('/api/v1/admin/products/sync-data-plans', [$products, 'syncDataPlans'], [$adminMw]);

$coupons = new AdminCouponController();
$router->get('/api/v1/admin/coupons', [$coupons, 'index'], [$adminMw]);
$router->post('/api/v1/admin/coupons', [$coupons, 'store'], [$adminMw]);

$adminBlog = new AdminBlogController();
$router->get('/api/v1/admin/blog', [$adminBlog, 'index'], [$adminMw]);
$router->post('/api/v1/admin/blog', [$adminBlog, 'store'], [$adminMw]);
$router->put('/api/v1/admin/blog/{id}', [$adminBlog, 'update'], [$adminMw]);
$router->post('/api/v1/admin/blog/{id}/toggle-status', [$adminBlog, 'toggleStatus'], [$adminMw]);
$router->delete('/api/v1/admin/blog/{id}', [$adminBlog, 'destroy'], [$adminMw]);

$activityLogs = new ActivityLogController();
$router->get('/api/v1/admin/activity-logs', [$activityLogs, 'index'], [$adminMw]);
$router->post('/api/v1/admin/products/sync-data-plans', [$products, 'syncDataPlans'], [$adminMw]);


$navItems = new NavItemController();
$router->get('/api/v1/admin/nav-items', [$navItems, 'index'], [$adminMw]);
$router->put('/api/v1/admin/nav-items/{id}', [$navItems, 'update'], [$adminMw]);