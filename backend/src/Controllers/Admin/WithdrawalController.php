<?php

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Models\AuditLog;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;

class WithdrawalController
{
    public function pending(Request $request): void
    {
        $rows = Withdrawal::pending();
        Response::success(array_map(fn ($r) => [
            'id' => (string) $r['id'],
            'customer' => $r['customer_name'],
            'amount' => (float) $r['amount'],
            'bank' => $r['bank_name'],
            'accountNumber' => $r['account_number'],
            'requestedAt' => gmdate('c', strtotime($r['requested_at'])),
        ], $rows));
    }

    public function approve(Request $request): void
    {
        $id = (int) $request->param('id');
        $withdrawal = Withdrawal::find($id);
        if (!$withdrawal || $withdrawal['status'] !== 'pending') {
            Response::error('Withdrawal not found or already processed.', 404);
            return;
        }

        Withdrawal::setStatus($id, 'approved');

        // The wallet was already debited at request time (see WalletController::withdraw).
        // Approving here just confirms the payout was sent by finance/ops.
        AuditLog::record(
            $request->param('auth_admin_id'),
            'Approved withdrawal',
            "withdrawal_id={$id} user_id={$withdrawal['user_id']} amount={$withdrawal['amount']}",
            $request->ip()
        );

        Response::success(['success' => true]);
    }

    public function reject(Request $request): void
    {
        $id = (int) $request->param('id');
        $withdrawal = Withdrawal::find($id);
        if (!$withdrawal || $withdrawal['status'] !== 'pending') {
            Response::error('Withdrawal not found or already processed.', 404);
            return;
        }

        Withdrawal::setStatus($id, 'rejected');

        // Refund the wallet since the withdrawal did not go through.
        $refund = (float) $withdrawal['amount'] + (float) $withdrawal['fee'];
        $wallet = Wallet::credit((int) $withdrawal['user_id'], $refund);

        Transaction::create([
            'user_id' => $withdrawal['user_id'],
            'reference' => 'EB-RFND' . substr((string) time(), -6),
            'category' => 'wallet-funding',
            'title' => 'Withdrawal reversal',
            'subtitle' => 'Rejected withdrawal refund',
            'amount' => $refund,
            'fee' => 0,
            'status' => 'success',
            'balance_after' => $wallet['balance'],
        ]);

        AuditLog::record(
            $request->param('auth_admin_id'),
            'Rejected withdrawal',
            "withdrawal_id={$id} user_id={$withdrawal['user_id']} amount={$withdrawal['amount']}",
            $request->ip()
        );

        Response::success(['success' => true]);
    }
}
