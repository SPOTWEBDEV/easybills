<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\Otp;
use App\Models\User;
use App\Models\Wallet;

class AuthController
{
    public function register(Request $request): void
    {
        $data = $request->all();

        $validator = Validator::make()
            ->required($data, ['fullName', 'email', 'phone', 'password'])
            ->email($data, 'email')
            ->minLength($data, 'password', 6)
            ->regex($data, 'phone', '/^0\d{10}$/', 'Enter a valid 11-digit Nigerian phone number.');

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422, ['errors' => $validator->errors()]);
            return;
        }

        if (User::findByEmail($data['email'])) {
            Response::error('An account with this email already exists.', 409);
            return;
        }
        if (User::findByPhone($data['phone'])) {
            Response::error('An account with this phone number already exists.', 409);
            return;
        }

        $userId = User::create([
            'full_name' => $data['fullName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            'avatar_initials' => User::initials($data['fullName']),
            'status' => 'pending_verification',
        ]);

        Wallet::createForUser($userId);
        

        Otp::generate($userId, 'register');

        Response::success(['requiresOtp' => true, 'phone' => $data['phone']]);
    }

    public function verifyOtp(Request $request): void
    {
        $data = $request->all();

        $validator = Validator::make()->required($data, ['phone', 'code']);
        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $user = User::findByPhone($data['phone']);
        if (!$user) {
            Response::error('We could not find an account for this phone number.', 404);
            return;
        }

        $ok = Otp::verify((int) $user['id'], 'register', (string) $data['code']);
        if (!$ok) {
            Response::error('Incorrect or expired code. Please try again.', 422);
            return;
        }

        User::activate((int) $user['id']);
        $user = User::find((int) $user['id']);

        $token = Auth::issueUserToken((int) $user['id']);

        Response::success([
            'user' => User::toPublicArray($user),
            'token' => $token,
        ]);
    }

    public function resendOtp(Request $request): void
    {
        $phone = $request->input('phone');
        if (!$phone) {
            Response::error('Phone number is required.', 422);
            return;
        }

        $user = User::findByPhone($phone);
        if (!$user) {
            Response::error('We could not find an account for this phone number.', 404);
            return;
        }

        Otp::generate((int) $user['id'], 'register');

        Response::success(['sent' => true]);
    }

    public function login(Request $request): void
    {
        $data = $request->all();

        $validator = Validator::make()
            ->required($data, ['email', 'password'])
            ->email($data, 'email');

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $user = User::findByEmail($data['email']);
        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            Response::error('Incorrect email or password.', 401);
            return;
        }

        if ($user['status'] === 'suspended') {
            Response::error('This account has been suspended. Please contact support.', 403);
            return;
        }

        if ($user['status'] === 'pending_verification') {
            Otp::generate((int) $user['id'], 'register');
            Response::error('Please verify your phone number to continue.', 403, [
                'requiresOtp' => true,
                'phone' => $user['phone'],
            ]);
            return;
        }

        $token = Auth::issueUserToken((int) $user['id']);

        Response::success([
            'user' => User::toPublicArray($user),
            'token' => $token,
        ]);
    }

    public function forgotPassword(Request $request): void
    {
        $email = $request->input('email');
        if (!$email) {
            Response::error('Email is required.', 422);
            return;
        }

        $user = User::findByEmail($email);
        // Always respond success even if the account doesn't exist, to avoid
        // leaking which emails are registered.
        if ($user) {
            Otp::generate((int) $user['id'], 'reset');
        }

        Response::success(['sent' => true]);
    }

    public function resetPassword(Request $request): void
    {
        $data = $request->all();
        $validator = Validator::make()
            ->required($data, ['email', 'code', 'password'])
            ->minLength($data, 'password', 6);

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $user = User::findByEmail($data['email']);
        if (!$user) {
            Response::error('Invalid request.', 422);
            return;
        }

        $ok = Otp::verify((int) $user['id'], 'reset', (string) $data['code']);
        if (!$ok) {
            Response::error('Incorrect or expired code.', 422);
            return;
        }

        User::updatePassword((int) $user['id'], password_hash($data['password'], PASSWORD_BCRYPT));

        Response::success(['reset' => true]);
    }

    public function logout(Request $request): void
    {
        // JWTs are stateless; the client simply discards the token.
        // If you need server-side revocation, add a `token_blacklist` table
        // and check it inside AuthMiddleware.
        Response::success(['success' => true]);
    }

    public function me(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $user = User::find($userId);
        if (!$user) {
            Response::error('User not found.', 404);
            return;
        }
        Response::success(['user' => User::toPublicArray($user)]);
    }
}
