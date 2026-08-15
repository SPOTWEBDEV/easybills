<?php

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Core\EpinsClient;
use App\Core\EpinsException;
use App\Core\Request;
use App\Core\Response;
use PDO;
use Throwable;

class ProviderController
{
    public function index(Request $request): void
    {
        $db = Database::connection();

        $networks = $db->query('SELECT id, name, status FROM network_providers')->fetchAll(PDO::FETCH_ASSOC);
        $electricity = $db->query('SELECT id, name, status FROM electricity_providers')->fetchAll(PDO::FETCH_ASSOC);

        $all = [];
        foreach ($networks as $n) {
            $all[] = ['id' => $n['id'], 'name' => $n['name'], 'type' => 'Network', 'status' => $n['status']];
        }
        foreach ($electricity as $e) {
            $all[] = ['id' => $e['id'], 'name' => $e['name'], 'type' => 'Electricity', 'status' => $e['status']];
        }

        Response::success($all);
    }

    /**
     * Live sanity check against ePINs — surfaces our wholesale wallet
     * balance so admins know if the platform is at risk of running dry.
     */
    public function epinsStatus(Request $request): void
    {
        try {
            $client = new EpinsClient();
            $result = $client->walletBalance();
            Response::success([
                'connected' => EpinsClient::isSuccess($result) || isset($result['balance']),
                'raw' => $result,
            ]);
        } catch (EpinsException|Throwable $e) {
            Response::success(['connected' => false, 'error' => $e->getMessage()]);
        }
    }
}
