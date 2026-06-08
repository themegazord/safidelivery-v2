<?php

namespace App\Services\IFOOD;

trait CatalogEndpoints
{
	protected string $catalogUrlBase = 'https://merchant-api.ifood.com.br/catalog/v2.0';

	public function getListAllCatalogsFromMerchant(string $merchantId): string
	{
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/catalogs";
	}

	public function getListAllCategoriesFromCatalog(string $merchantId, string $catalogId, bool $includeItems = false): string
	{
		$url = "{$this->catalogUrlBase}/merchants/{$merchantId}/catalogs/{$catalogId}/categories";
		return $includeItems ? "{$url}?includeItems=true" : $url;
	}

	public function getCategoryItems(string $merchantId, string $categoryId): string
	{
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/categories/{$categoryId}/items";
	}

	public function getItemFlat(string $merchantId, string $itemId): string
	{
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/items/{$itemId}/flat";
	}

	public function getProductById(string $merchantId, string $productId): string
	{
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/product/{$productId}";
	}

	public function createCategory(string $merchantId, string $catalogId): string
	{
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/catalogs/{$catalogId}/categories";
	}

	public function getUpsertItemUrl(string $merchantId): string
	{
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/items";
	}

	public function getUploadImage(string $merchantId): string
	{
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/image/upload";
	}

	public function getUpdateItemStatusUrl(string $merchantId): string
	{
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/items/status";
	}

	public function getUpdatePricePerItemUrl(string $merchantId): string {
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/items/price";
	}

	public function getUpdateExternalIdPerItemUrl(string $merchantId): string {
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/items/externalCode";
	}

	public function getUpdateOptionPriceUrl(string $merchantId): string {
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/options/price";
	}

	public function getUpdateOptionStatusUrl(string $merchantId): string {
		return "{$this->catalogUrlBase}/merchants/{$merchantId}/options/status";
	}
}
