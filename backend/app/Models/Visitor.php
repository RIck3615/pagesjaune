<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Visitor extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip_address',
        'user_agent',
        'country',
        'city',
        'visited_at'
    ];

    protected $casts = [
        'visited_at' => 'datetime',
    ];

    /**
     * Enregistrer un nouveau visiteur
     */
    public static function recordVisit($ipAddress, $userAgent = null, $country = null, $city = null)
    {
        // Vérifier si cette IP a déjà visité aujourd'hui
        $today = Carbon::today();
        $existingVisitor = self::where('ip_address', $ipAddress)
            ->whereDate('visited_at', $today)
            ->first();

        if (!$existingVisitor) {
            return self::create([
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'country' => $country,
                'city' => $city,
                'visited_at' => now()
            ]);
        }

        return $existingVisitor;
    }

    /**
     * Obtenir le nombre de visiteurs uniques aujourd'hui
     */
    public static function getTodayCount()
    {
        return self::whereDate('visited_at', Carbon::today())->count();
    }

    /**
     * Obtenir le nombre total de visiteurs
     */
    public static function getTotalCount()
    {
        return self::count();
    }

    /**
     * Obtenir les statistiques des 7 derniers jours
     */
    public static function getWeeklyStats()
    {
        return self::selectRaw('DATE(visited_at) as date, COUNT(*) as count')
            ->where('visited_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }
}
