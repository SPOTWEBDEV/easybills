<?php

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\AuditLog;
use App\Models\Referral;
use App\Models\Setting;

class ReferralProgramController
{
    public function overview(Request $request): void
    {
        $stats = Referral::programStats();
        $settings = Setting::many(['referral_referrer_reward', 'referral_referred_reward', 'referral_reward_trigger']);
        $topReferrers = Referral::topReferrers();

        Response::success([
            'stats' => $stats,
            'settings' => [
                'referrerReward' => (float) ($settings['referral_referrer_reward'] ?? 500),
                'referredReward' => (float) ($settings['referral_referred_reward'] ?? 200),
                'rewardTrigger' => $settings['referral_reward_trigger'] ?? "After referred user's first successful purchase",
            ],
            'topReferrers' => array_map(fn ($r) => [
                'id' => $r['name'] . '-' . $r['last_referral'],
                'name' => $r['name'],
                'invites' => (int) $r['invites'],
                'earned' => (float) $r['earned'],
                'lastReferral' => gmdate('c', strtotime($r['last_referral'])),
            ], $topReferrers),
        ]);
    }

    public function updateSettings(Request $request): void
    {
        $data = $request->all();
        $validator = Validator::make()
            ->required($data, ['referrerReward', 'referredReward'])
            ->numeric($data, 'referrerReward')
            ->numeric($data, 'referredReward');

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        Setting::set('referral_referrer_reward', (string) $data['referrerReward']);
        Setting::set('referral_referred_reward', (string) $data['referredReward']);
        if (!empty($data['rewardTrigger'])) {
            Setting::set('referral_reward_trigger', $data['rewardTrigger']);
        }

        AuditLog::record($request->param('auth_admin_id'), 'Updated referral program settings', '', $request->ip());

        Response::success(['success' => true]);
    }
}