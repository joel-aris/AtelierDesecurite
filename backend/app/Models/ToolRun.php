<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ToolRun extends Model
{
    protected $fillable = ['user_id', 'guest_id', 'tool', 'input', 'result'];

    protected $casts = [
        'input' => 'array',
        'result' => 'array',
    ];
}
