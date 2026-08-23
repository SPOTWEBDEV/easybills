<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Referral;
use App\Models\Setting;
use App\Models\User;

class ReferralController
{
    public function summary(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $user = User::find($userId);
        $summary = Referral::summaryForUser($userId);
        $rewardPerReferral = (float) Setting::get('referral_referrer_reward', '500');

        Response::success([
            'referralCode' => $user['referral_code'] ?? '',
            'totalInvites' => $summary['totalInvites'],
            'totalEarned' => $summary['totalEarned'],
            'rewardPerReferral' => $rewardPerReferral,
        ]);
    }

    public function history(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $rows = Referral::historyForUser($userId);

        Response::success(array_map(fn ($r) => [
            'id' => (string) $r['id'],
            'name' => $r['referred_name'],
            'status' => $r['status'],
            'amount' => (float) $r['reward_amount'],
            'date' => gmdate('c', strtotime($r['created_at'])),
        ], $rows));
    }
}