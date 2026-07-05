<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IncidentEvent extends Model
{
    protected $fillable = ['incident_id', 'from_status', 'to_status', 'note'];
}
