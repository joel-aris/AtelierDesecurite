<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecurityAudit extends Model
{
    protected $fillable = ['user_id', 'guest_id', 'title', 'answers', 'scores', 'recommendations'];

    protected $casts = [
        'answers' => 'array',
        'scores' => 'array',
        'recommendations' => 'array',
    ];
}
