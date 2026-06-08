<?php

namespace App\Services\IFOOD;

trait EventEndpoints
{
  protected string $urlBaseEventos = "https://merchant-api.ifood.com.br/events/v1.0/";
  protected string $pollingEvents = "/events:polling?types=PLC%2CCAN%2CCON&groups=ORDER_STATUS%2CDELIVERY%2CORDER_HANDSHAKE";
  protected string $ackEvents = "/events/acknowledgment";
}
