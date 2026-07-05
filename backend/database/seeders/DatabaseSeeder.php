<?php

namespace Database\Seeders;

use App\Models\Incident;
use App\Models\KnownMaliciousHash;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        $admin = User::firstOrCreate(
            ['email' => 'admin@secure-office.test'],
            ['name' => 'Admin Demo', 'password' => Hash::make('password'), 'is_active' => true]
        );
        $admin->syncRoles([$adminRole]);

        $user = User::firstOrCreate(
            ['email' => 'user@secure-office.test'],
            ['name' => 'Demo User', 'password' => Hash::make('password'), 'is_active' => true]
        );
        $user->syncRoles([$userRole]);

        foreach ([
            ['44d88612fea8a8f36de82e1278abb02f', 'md5', 'EICAR test file'],
            ['e99a18c428cb38d5f260853678922e03', 'md5', 'Hash de démonstration'],
            ['275a021bbfb6489e54d471899f7db9d1', 'md5', 'Signature atelier'],
        ] as [$hash, $algorithm, $label]) {
            KnownMaliciousHash::firstOrCreate(['hash' => $hash], compact('algorithm', 'label'));
        }

        Incident::firstOrCreate(
            ['title' => 'Email suspect comptabilité', 'user_id' => $user->id],
            ['category' => 'phishing', 'severity' => 'élevé', 'status' => 'ouvert', 'incident_date' => now()->toDateString(), 'description' => 'Demande urgente de virement reçue par email.']
        );
    }
}
