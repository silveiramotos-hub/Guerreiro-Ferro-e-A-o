import { CatalogProduct, ProductCategory } from '../data/catalogData';

export interface QuoteCartItem {
  productId: string;
  productName: string;
  sku: string;
  variantId: string;
  variantLabel: string;
  unitPriceBrl: number;
  weightKgPerUnit: number;
  unitLabel: string;
  quantity: number;
}

export interface CustomCutSpec {
  materialType: 'chapa' | 'tubo' | 'perfil';
  thicknessMm: number;
  widthMm: number;
  lengthMm: number;
  quantity: number;
  includeBending: boolean;
}

export interface CustomCutCalculationResult {
  unitWeightKg: number;
  totalWeightKg: number;
  estimatedPriceBrl: number;
  summaryText: string;
}

export interface ContactFormInput {
  fullName: string;
  phone: string;
  email: string;
  customerType: 'Serralheria' | 'Construtora' | 'Indústria' | 'Particular';
  city: string;
  deliveryPreference: 'Retirada no Galpão (Centro)' | 'Entrega em Obra / Oficina';
  projectNotes: string;
}

export interface ContactFormValidation {
  isValid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
}

/**
 * Filters products by category and search query (name, SKU, description, or variant dimensions).
 */
export function filterCatalogProducts(
  products: CatalogProduct[],
  category: ProductCategory,
  searchQuery: string
): CatalogProduct[] {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory = category === 'todos' || product.category === category;
    if (!matchesCategory) return false;

    if (!normalizedSearch) return true;

    const inProductFields =
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.sku.toLowerCase().includes(normalizedSearch) ||
      product.shortDescription.toLowerCase().includes(normalizedSearch) ||
      product.application.toLowerCase().includes(normalizedSearch) ||
      product.normSpec.toLowerCase().includes(normalizedSearch);

    const inVariants = product.variants.some(
      (v) =>
        v.label.toLowerCase().includes(normalizedSearch) ||
        v.dimensions.toLowerCase().includes(normalizedSearch)
    );

    return inProductFields || inVariants;
  });
}

/**
 * Adds or increments an item in the quote cart.
 */
export function addOrUpdateCartItem(
  cart: QuoteCartItem[],
  newItem: Omit<QuoteCartItem, 'quantity'>,
  quantityToAdd: number
): QuoteCartItem[] {
  const safeQty = Math.max(1, Math.round(quantityToAdd));
  const existingIndex = cart.findIndex(
    (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
  );

  if (existingIndex === -1) {
    return [...cart, { ...newItem, quantity: safeQty }];
  }

  return cart.map((item, idx) =>
    idx === existingIndex ? { ...item, quantity: item.quantity + safeQty } : item
  );
}

/**
 * Updates quantity of a specific variant in cart; removes item if quantity <= 0.
 */
export function updateCartItemQuantity(
  cart: QuoteCartItem[],
  productId: string,
  variantId: string,
  newQuantity: number
): QuoteCartItem[] {
  const rounded = Math.round(newQuantity);
  if (rounded <= 0) {
    return cart.filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );
  }

  return cart.map((item) =>
    item.productId === productId && item.variantId === variantId
      ? { ...item, quantity: rounded }
      : item
  );
}

/**
 * Calculates total items count, total weight (kg), and estimated subtotal (BRL) for the quote cart.
 */
export function calculateCartTotals(cart: QuoteCartItem[]): {
  totalUnits: number;
  totalDistinctItems: number;
  totalWeightKg: number;
  estimatedTotalBrl: number;
  qualifiesFreeLocalFreight: boolean;
} {
  let totalUnits = 0;
  let totalWeightKg = 0;
  let estimatedTotalBrl = 0;

  for (const item of cart) {
    totalUnits += item.quantity;
    totalWeightKg += item.weightKgPerUnit * item.quantity;
    estimatedTotalBrl += item.unitPriceBrl * item.quantity;
  }

  return {
    totalUnits,
    totalDistinctItems: cart.length,
    totalWeightKg: Number(totalWeightKg.toFixed(2)),
    estimatedTotalBrl: Number(estimatedTotalBrl.toFixed(2)),
    qualifiesFreeLocalFreight: estimatedTotalBrl >= 1200,
  };
}

/**
 * Calculates theoretical steel weight (density = 7.85 g/cm³) and estimated fabrication cost
 * for custom cut & bend requests.
 */
export function calculateCustomSteelCut(spec: CustomCutSpec): CustomCutCalculationResult {
  const thicknessM = Math.max(0.4, spec.thicknessMm) / 1000;
  const widthM = Math.max(10, spec.widthMm) / 1000;
  const lengthM = Math.max(50, spec.lengthMm) / 1000;
  const quantity = Math.max(1, Math.round(spec.quantity));

  // Steel density: 7850 kg/m³
  const STEEL_DENSITY_KG_M3 = 7850;
  let volumeM3 = thicknessM * widthM * lengthM;

  if (spec.materialType === 'tubo') {
    // Hollow rectangular tube perimeter approx 2 * (width + width*0.6)
    const perimeterM = 2 * (widthM + widthM * 0.6);
    volumeM3 = perimeterM * thicknessM * lengthM;
  } else if (spec.materialType === 'perfil') {
    // U-profile web + 2 flanges
    const unfoldedWidthM = widthM + 2 * (widthM * 0.45);
    volumeM3 = unfoldedWidthM * thicknessM * lengthM;
  }

  const rawUnitWeight = Math.max(0.15, volumeM3 * STEEL_DENSITY_KG_M3);
  const unitWeightKg = Number(rawUnitWeight.toFixed(2));
  const totalWeightKg = Number((unitWeightKg * quantity).toFixed(2));

  const baseRatePerKg = spec.materialType === 'chapa' ? 10.8 : 10.4;
  const bendingMultiplier = spec.includeBending ? 1.18 : 1.05;
  const estimatedPriceBrl = Number((totalWeightKg * baseRatePerKg * bendingMultiplier).toFixed(2));

  const typeLabel =
    spec.materialType === 'chapa'
      ? 'Chapa de Aço Sob Medida'
      : spec.materialType === 'tubo'
        ? 'Tubo Cortado em Serra de Fita'
        : 'Perfil U Dobrado Sob Medida';

  const bendSuffix = spec.includeBending ? 'c/ Dobra CNC' : 'Corte Reto';
  const summaryText = `${typeLabel} (${bendSuffix}) — Esp. ${spec.thicknessMm}mm × ${spec.widthMm}mm × ${spec.lengthMm}mm (${quantity} un · ${totalWeightKg} kg)`;

  return {
    unitWeightKg,
    totalWeightKg,
    estimatedPriceBrl,
    summaryText,
  };
}

/**
 * Validates the customer contact / quote request form.
 */
export function validateContactForm(input: ContactFormInput): ContactFormValidation {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {};

  if (!input.fullName || input.fullName.trim().length < 3) {
    errors.fullName = 'Informe seu nome completo ou responsável pela compra.';
  }

  const digitsOnlyPhone = (input.phone || '').replace(/\D/g, '');
  if (digitsOnlyPhone.length < 10 || digitsOnlyPhone.length > 13) {
    errors.phone = 'Informe um WhatsApp ou telefone válido com DDD (ex: 75 99925-4235).';
  }

  if (input.email && input.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email.trim())) {
      errors.email = 'Formato de e-mail inválido.';
    }
  }

  if (!input.city || input.city.trim().length < 2) {
    errors.city = 'Informe a cidade da obra ou entrega.';
  }

  if (!input.projectNotes || input.projectNotes.trim().length < 8) {
    errors.projectNotes = 'Descreva os materiais, medidas ou serviço desejado (mín. 8 caracteres).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Formats a clean, structured WhatsApp URL for Guerreiro Ferro e Aço.
 */
export function buildWhatsAppQuoteUrl(params: {
  whatsappNumber: string;
  cart: QuoteCartItem[];
  contact?: Partial<ContactFormInput>;
  customSubject?: string;
}): string {
  const lines: string[] = [
    '*SOLICITAÇÃO DE ORÇAMENTO — GUERREIRO FERRO E AÇO (ALAGOINHAS)*',
    '',
  ];

  if (params.customSubject) {
    lines.push(`*Assunto:* ${params.customSubject}`);
    lines.push('');
  }

  if (params.contact?.fullName) {
    lines.push(`*Cliente:* ${params.contact.fullName.trim()}`);
  }
  if (params.contact?.customerType) {
    lines.push(`*Perfil:* ${params.contact.customerType}`);
  }
  if (params.contact?.phone) {
    lines.push(`*Contato:* ${params.contact.phone.trim()}`);
  }
  if (params.contact?.city) {
    lines.push(`*Cidade/Obra:* ${params.contact.city.trim()}`);
  }
  if (params.contact?.deliveryPreference) {
    lines.push(`*Logística:* ${params.contact.deliveryPreference}`);
  }

  if (params.cart.length > 0) {
    lines.push('');
    lines.push('*ITENS SELECIONADOS NO CATÁLOGO:*');
    const totals = calculateCartTotals(params.cart);
    for (const item of params.cart) {
      const lineTotal = (item.unitPriceBrl * item.quantity).toFixed(2).replace('.', ',');
      const lineWeight = (item.weightKgPerUnit * item.quantity).toFixed(1).replace('.', ',');
      lines.push(
        `• ${item.quantity}x ${item.productName} (${item.variantLabel}) — Peso: ${lineWeight} kg — Est.: R$ ${lineTotal}`
      );
    }
    lines.push('');
    lines.push(
      `*Peso Total Estimado:* ${totals.totalWeightKg.toFixed(2).replace('.', ',')} kg`
    );
    lines.push(
      `*Subtotal de Referência:* R$ ${totals.estimatedTotalBrl.toFixed(2).replace('.', ',')}`
    );
  }

  if (params.contact?.projectNotes && params.contact.projectNotes.trim()) {
    lines.push('');
    lines.push(`*Observações / Medidas Especiais:*`);
    lines.push(params.contact.projectNotes.trim());
  }

  lines.push('');
  lines.push('Aguardo confirmação de disponibilidade e condições de pagamento.');

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${params.whatsappNumber}?text=${encoded}`;
}
