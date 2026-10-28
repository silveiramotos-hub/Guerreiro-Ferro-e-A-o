import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG_PRODUCTS } from '../data/catalogData';
import {
  filterCatalogProducts,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  calculateCartTotals,
  calculateCustomSteelCut,
  validateContactForm,
  buildWhatsAppQuoteUrl,
} from './metallurgyLogic';

test('filterCatalogProducts filters by category and search query accurately', () => {
  const all = filterCatalogProducts(CATALOG_PRODUCTS, 'todos', '');
  assert.equal(all.length, CATALOG_PRODUCTS.length);

  const metalonOnly = filterCatalogProducts(CATALOG_PRODUCTS, 'tubos-metalon', '');
  assert.equal(metalonOnly.length, 1);
  assert.equal(metalonOnly[0].id, 'metalon-retangular-galv');

  const byDimension = filterCatalogProducts(CATALOG_PRODUCTS, 'todos', '50 x 30');
  assert.equal(byDimension.length, 1);
  assert.equal(byDimension[0].sku, 'GFA-MET-01');

  const noMatch = filterCatalogProducts(CATALOG_PRODUCTS, 'chapas-aco', 'inexistente-xyz');
  assert.equal(noMatch.length, 0);
});

test('cart operations add, increment, update, and compute accurate weight and BRL totals', () => {
  let cart = addOrUpdateCartItem(
    [],
    {
      productId: 'metalon-retangular-galv',
      productName: 'Tubo Metalon Retangular e Quadrado',
      sku: 'GFA-MET-01',
      variantId: 'met-50x30-16',
      variantLabel: '50 x 30 mm · Chapa 16 (1,50 mm)',
      unitPriceBrl: 118.0,
      weightKgPerUnit: 11.1,
      unitLabel: 'barra 6m',
    },
    5
  );

  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 5);

  // Increment same variant
  cart = addOrUpdateCartItem(
    cart,
    {
      productId: 'metalon-retangular-galv',
      productName: 'Tubo Metalon Retangular e Quadrado',
      sku: 'GFA-MET-01',
      variantId: 'met-50x30-16',
      variantLabel: '50 x 30 mm · Chapa 16 (1,50 mm)',
      unitPriceBrl: 118.0,
      weightKgPerUnit: 11.1,
      unitLabel: 'barra 6m',
    },
    6
  );

  assert.equal(cart[0].quantity, 11);

  const totals = calculateCartTotals(cart);
  assert.equal(totals.totalUnits, 11);
  assert.equal(totals.totalWeightKg, 122.1);
  assert.equal(totals.estimatedTotalBrl, 1298.0);
  assert.equal(totals.qualifiesFreeLocalFreight, true);

  // Remove item when quantity updated to 0
  cart = updateCartItemQuantity(cart, 'metalon-retangular-galv', 'met-50x30-16', 0);
  assert.equal(cart.length, 0);
});

test('calculateCustomSteelCut computes physical steel weight and price accurately', () => {
  const result = calculateCustomSteelCut({
    materialType: 'chapa',
    thicknessMm: 3.0,
    widthMm: 1000,
    lengthMm: 2000,
    quantity: 2,
    includeBending: true,
  });

  // 0.003m * 1m * 2m * 7850 kg/m3 = 47.1 kg per sheet
  assert.equal(result.unitWeightKg, 47.1);
  assert.equal(result.totalWeightKg, 94.2);
  assert.ok(result.estimatedPriceBrl > 1000);
  assert.ok(result.summaryText.includes('c/ Dobra CNC'));
});

test('validateContactForm catches invalid inputs and passes valid quote requests', () => {
  const invalid = validateContactForm({
    fullName: 'Jo',
    phone: '123',
    email: 'email-invalido',
    customerType: 'Serralheria',
    city: '',
    deliveryPreference: 'Retirada no Galpão (Centro)',
    projectNotes: 'Curto',
  });

  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.city);
  assert.ok(invalid.errors.projectNotes);

  const valid = validateContactForm({
    fullName: 'Marcos Oliveira',
    phone: '(75) 99811-2233',
    email: 'marcos@serralheria.com.br',
    customerType: 'Serralheria',
    city: 'Alagoinhas - BA',
    deliveryPreference: 'Entrega em Obra / Oficina',
    projectNotes: 'Preciso de 15 barras de Metalon 50x30 chapa 16 e 2 chapas xadrez.',
  });

  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('buildWhatsAppQuoteUrl generates valid wa.me link with encoded items and customer details', () => {
  const url = buildWhatsAppQuoteUrl({
    whatsappNumber: '5575999254235',
    cart: [
      {
        productId: 'chapa-xadrez-piso',
        productName: 'Chapa de Aço Xadrez',
        sku: 'GFA-CHP-02',
        variantId: 'chp-xadrez-1-8',
        variantLabel: 'Chapa Xadrez 1/8"',
        unitPriceBrl: 615,
        weightKgPerUnit: 59.5,
        unitLabel: 'chapa',
        quantity: 2,
      },
    ],
    contact: {
      fullName: 'Roberto Silva',
      phone: '(75) 99911-0000',
      city: 'Alagoinhas',
      customerType: 'Construtora',
    },
  });

  assert.ok(url.startsWith('https://wa.me/5575999254235?text='));
  const decoded = decodeURIComponent(url.replace('https://wa.me/5575999254235?text=', ''));
  assert.ok(decoded.includes('Roberto Silva'));
  assert.ok(decoded.includes('2x Chapa de Aço Xadrez'));
  assert.ok(decoded.includes('119,00 kg'));
});
