<?php

namespace App\Services\IFOOD;

trait OrderEndpoints {
  protected string $urlBaseAutenticacao = "https://merchant-api.ifood.com.br/authentication/v1.0";
  protected string $urlBaseOrders = "https://merchant-api.ifood.com.br/order/v1.0/";
  protected string $oauthToken = "/oauth/token";
  protected string $detailsOrder = "orders/";
  protected string $handshakePlataform = "disputes/";

  protected function getDetailsOrderWithOrderID(string $order_id): string {
    return $this->detailsOrder . $order_id;
  }

  protected function getAcceptOrderWithOrderID(string $order_id): string {
    return $this->detailsOrder . $order_id . "/confirm";
  }

  protected function getReadyToPickupWithOrderID(string $order_id): string {
    return $this->detailsOrder . $order_id . "/readyToPickup";
  }

  protected function getDispatchOrderWithOrderID(string $order_id): string {
    return $this->detailsOrder . $order_id . "/dispatch";
  }

  protected function getCancellationReasons(string $order_id): string {
    return $this->detailsOrder . $order_id . "/cancellationReasons";
  }

  protected function getRequestCancellation(string $order_id): string {
    return $this->detailsOrder . $order_id . "/requestCancellation";
  }

  protected function getHandshakeAccept(string $dispute_id): string {
    return $this->handshakePlataform . $dispute_id . "/accept";
  }

  protected function getHandshakeDeny(string $dispute_id): string {
    return $this->handshakePlataform . $dispute_id . "/reject";
  }

  protected function getHandshakeCounterProposal(string $dispute_id, string $alternative_id): string {
    return $this->handshakePlataform . $dispute_id . "/alternatives/" . $alternative_id;
  }

  protected function validatePickupCode(string $order_id): string {
    return $this->detailsOrder . $order_id . '/validatePickupCode';
  }
}
