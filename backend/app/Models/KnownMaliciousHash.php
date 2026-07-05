<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KnownMaliciousHash extends Model
{
    protected $fillable = ['hash', 'algorithm', 'label', 'description'];
}
