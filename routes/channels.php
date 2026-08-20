<?php

use App\Models\Pedido;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('EnviaMensagemSobrePedido.{pedidoId}', function ($user, $pedidoId) {
    $pedido = Pedido::with(['cliente', 'empresa'])->find($pedidoId);

    if (! $pedido) {
        return false;
    }

    if ($pedido->cliente?->user_id === $user->id) {
        return true;
    }

    return $pedido->empresa?->email === $user->email;
});
