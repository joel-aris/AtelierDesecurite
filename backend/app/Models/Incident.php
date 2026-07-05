<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    protected $fillable = ['user_id', 'guest_id', 'title', 'description', 'category', 'severity', 'status', 'incident_date', 'attachments'];

    protected $casts = [
        'attachments' => 'array',
        'incident_date' => 'date',
    ];

    public function events()
    {
        return $this->hasMany(IncidentEvent::class);
    }
}
