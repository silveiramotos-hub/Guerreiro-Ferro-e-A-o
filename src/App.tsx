/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  Wrench,
  Check,
  MessageSquare,
  ArrowRight,
  Calculator,
  Phone,
  MapPin,
  FileCheck,
} from 'lucide-react';
import {
  BUSINESS_INFO,
  CATEGORY_FILTERS,
  CATALOG_PRODUCTS,
  SPECIALIZED_SERVICES,
  CUSTOMER_TESTIMONIALS,
  ProductCategory,
  CatalogProduct,
} from './data/catalogData';
import {
  QuoteCartItem,
  CustomCutSpec,
  ContactFormInput,
  filterCatalogProducts,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  calculateCartTotals,
  calculateCustomSteelCut,
  validateContactForm,
  buildWhatsAppQuoteUrl,
} from './utils/metallurgyLogic';
import { ProductTechnicalIllustration } from './components/SteelTechnicalArt';
import { LocationMapSection } from './components/LocationMapSection';
import { QuoteDrawer } from './components/QuoteDrawer';

interface SubmittedQuoteRecord {
  protocol: string;
  timestamp: string;
  customerName: string;
  customerType: string;
  city: string;
  itemsCount: number;
  totalWeightKg: number;
  estimatedTotalBrl: number;
  whatsappUrl: string;
}

export default function App() {
  // Google Maps Platform Quota Exceeded Banner State
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Catalog Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected variant per product ID
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const prod of CATALOG_PRODUCTS) {
      if (prod.variants[0]) {
        initial[prod.id] = prod.variants[0].id;
      }
    }
    return initial;
  });

  // Quantity input per product ID
  const [cardQuantities, setCardQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const prod of CATALOG_PRODUCTS) {
      initial[prod.id] = 1;
    }
    return initial;
  });

  // Quote Cart State (seeded with 1 popular item or empty? Let's start empty and allow instant adding, with clear visual feedback)
  const [cart, setCart] = useState<QuoteCartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Specialized Services — Custom Steel Cut & Weight Calculator State
  const [cutSpec, setCutSpec] = useState<CustomCutSpec>({
    materialType: 'chapa',
    thicknessMm: 3.0,
    widthMm: 1000,
    lengthMm: 2000,
    quantity: 2,
    includeBending: true,
  });
  const [customCutAddedBanner, setCustomCutAddedBanner] = useState(false);

  // Testimonials Filter State
  const [testimonialSector, setTestimonialSector] = useState<string>('Todos');

  // Contact / Quote Request Form State
  const [contactInput, setContactInput] = useState<ContactFormInput>({
    fullName: '',
    phone: '',
    email: '',
    customerType: 'Serralheria',
    city: 'Alagoinhas - BA',
    deliveryPreference: 'Entrega em Obra / Oficina',
    projectNotes: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContactFormInput, string>>>({});
  const [submittedQuote, setSubmittedQuote] = useState<SubmittedQuoteRecord | null>(null);

  // Filtered Products
  const filteredProducts = useMemo(
    () => filterCatalogProducts(CATALOG_PRODUCTS, selectedCategory, searchQuery),
    [selectedCategory, searchQuery]
  );

  // Cart Totals
  const cartTotals = useMemo(() => calculateCartTotals(cart), [cart]);

  // Custom Cut Calculation
  const cutCalculation = useMemo(() => calculateCustomSteelCut(cutSpec), [cutSpec]);

  // Filtered Testimonials
  const filteredTestimonials = useMemo(() => {
    if (testimonialSector === 'Todos') return CUSTOMER_TESTIMONIALS;
    return CUSTOMER_TESTIMONIALS.filter((t) => t.sector === testimonialSector);
  }, [testimonialSector]);

  // Add catalog product variant to quote cart
  const handleAddProductToQuote = (product: CatalogProduct) => {
    const variantId = selectedVariants[product.id] || product.variants[0].id;
    const variant = product.variants.find((v) => v.id === variantId) || product.variants[0];
    const qty = cardQuantities[product.id] || 1;

    setCart((prev) =>
      addOrUpdateCartItem(
        prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          variantId: variant.id,
          variantLabel: variant.label,
          unitPriceBrl: variant.unitPriceBrl,
          weightKgPerUnit: variant.weightKg,
          unitLabel: variant.unitLabel,
        },
        qty
      )
    );

    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 1800);
  };

  const handleUpdateCartQuantity = (productId: string, variantId: string, newQty: number) => {
    setCart((prev) => updateCartItemQuantity(prev, productId, variantId, newQty));
  };

  // Add custom cut specification to Quote Cart & Project Notes
  const handleAddCustomCutToQuote = () => {
    const customVariantId = `cut-${cutSpec.materialType}-${cutSpec.thicknessMm}-${cutSpec.widthMm}-${cutSpec.lengthMm}-${cutSpec.includeBending ? 'dobra' : 'reto'}`;
    setCart((prev) =>
      addOrUpdateCartItem(
        prev,
        {
          productId: 'servico-corte-dobra-sob-medida',
          productName:
            cutSpec.materialType === 'chapa'
              ? 'Serviço Corte/Dobra de Chapa Sob Medida'
              : cutSpec.materialType === 'tubo'
                ? 'Pacote Tubo Cortado em Serra de Fita'
                : 'Perfil Estrutural Dobrado Sob Medida',
          sku: 'GFA-SRV-CNC',
          variantId: customVariantId,
          variantLabel: `${cutSpec.thicknessMm}mm × ${cutSpec.widthMm}mm × ${cutSpec.lengthMm}mm (${cutSpec.includeBending ? 'c/ Dobra' : 'Corte Reto'})`,
          unitPriceBrl: Number((cutCalculation.estimatedPriceBrl / cutSpec.quantity).toFixed(2)),
          weightKgPerUnit: cutCalculation.unitWeightKg,
          unitLabel: 'peça sob medida',
        },
        cutSpec.quantity
      )
    );

    setContactInput((prev) => ({
      ...prev,
      projectNotes: prev.projectNotes
        ? `${prev.projectNotes}\n• ${cutCalculation.summaryText}`
        : `• ${cutCalculation.summaryText}`,
    }));

    setCustomCutAddedBanner(true);
    setTimeout(() => setCustomCutAddedBanner(false), 2500);
  };

  // Handle Contact Form Submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContactForm(contactInput);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    const protocolNumber = `GFA-${Math.floor(100000 + Math.random() * 900000)}`;
    const whatsappUrl = buildWhatsAppQuoteUrl({
      whatsappNumber: BUSINESS_INFO.whatsappNumber,
      cart,
      contact: contactInput,
      customSubject: `Cotação Protocolo #${protocolNumber}`,
    });

    setSubmittedQuote({
      protocol: protocolNumber,
      timestamp: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      customerName: contactInput.fullName.trim(),
      customerType: contactInput.customerType,
      city: contactInput.city.trim(),
      itemsCount: cartTotals.totalUnits,
      totalWeightKg: cartTotals.totalWeightKg,
      estimatedTotalBrl: cartTotals.estimatedTotalBrl,
      whatsappUrl,
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const directWhatsAppUrl = useMemo(
    () =>
      buildWhatsAppQuoteUrl({
        whatsappNumber: BUSINESS_INFO.whatsappNumber,
        cart,
        customSubject: 'Atendimento Rápido — Site Guerreiro Ferro e Aço',
      }),
    [cart]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Mandatory Google Maps Platform Quota Warning Banner (Case A) */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* TOP BAR CONTRACT: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#topo"
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display"
          >
            Guerreiro Ferro e Aço
          </a>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav
            aria-label="Navegação Principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#catalogo"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Catálogo
            </a>
            <a
              href="#servicos"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Serviços
            </a>
            <a
              href="#depoimentos"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Depoimentos
            </a>
            <a
              href="#localizacao"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Localização
            </a>
            <a
              href="#contato"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Contato
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>
                Lista de Cotação ({cartTotals.totalUnits})
              </span>
            </button>
          </div>
        </div>
      </header>

      <main id="topo" className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-[#0F172A] text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              {/* Left Column: Value Proposition & Primary Action */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  {/* Clean unboxed regional metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400 tracking-wide">
                    <span>DISTRIBUIDORA E METALÚRGICA</span>
                    <span aria-hidden="true">·</span>
                    <span>CENTRO, ALAGOINHAS — BA</span>
                    <span aria-hidden="true">·</span>
                    <span>PRONTA ENTREGA</span>
                  </div>

                  <h1
                    className="mt-4 font-display font-bold tracking-tight text-white leading-[1.1]"
                    style={{
                      fontSize: 'clamp(2.25rem, 4vw, 3.65rem)',
                      textWrap: 'balance',
                    }}
                  >
                    Aço Estrutural, Tubos Metalon e Corte Sob Medida para Sua Obra ou Serralheria.
                  </h1>

                  <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                    Fornecemos barras de 6 metros, chapas xadrez e lisas, perfis U enrijecidos, telhas Galvalume e insumos de solda direto do nosso galpão na Rua da Leste em Alagoinhas com despacho rápido para toda a região.
                  </p>
                </div>

                {/* Hero CTAs */}
                <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => scrollToSection('catalogo')}
                    className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-2"
                  >
                    <span>Explorar Catálogo de Aço</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3.5 text-xs sm:text-sm font-semibold text-white border border-slate-700 hover:border-slate-500 hover:bg-slate-800/60 rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>WhatsApp Rápido: {BUSINESS_INFO.phoneDisplay}</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Interactive Industrial Blueprint & Quick Dispatch Card */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-4 border-b border-slate-800">
                    <span>ESPECIFICAÇÃO TÉCNICA · ABNT</span>
                    <span className="text-amber-400">GALPÃO RUA DA LESTE, 01</span>
                  </div>

                  {/* Isometric Industrial Steel Graphic */}
                  <div className="my-5 rounded-lg bg-slate-950 border border-slate-800/90 p-5">
                    <svg
                      viewBox="0 0 380 185"
                      className="w-full h-44"
                      role="img"
                      aria-label="Diagrama técnico de vigas metálicas, tubos estruturais e chapas de aço da Guerreiro Ferro e Aço"
                    >
                      <defs>
                        <linearGradient id="heroBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#F8FAFC" />
                          <stop offset="50%" stopColor="#94A3B8" />
                          <stop offset="100%" stopColor="#334155" />
                        </linearGradient>
                      </defs>
                      {/* Dimension lines */}
                      <line x1="25" y1="25" x2="355" y2="25" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
                      <text x="190" y="18" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                        COMPRIMENTO PADRÃO 6.000 mm · CORTE SOB MEDIDA
                      </text>
                      {/* Structural I-Beam / U-Profile */}
                      <polygon points="40,130 230,45 285,68 95,153" fill="url(#heroBeam)" stroke="#CBD5E1" strokeWidth="1.2" />
                      <polygon points="95,153 285,68 285,106 95,182" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
                      <polygon points="40,130 95,153 95,182 40,158" fill="#D97706" stroke="#FDE68A" strokeWidth="1.5" />
                      {/* Stacked Metalon Tubes */}
                      <polygon points="145,125 305,52 345,70 185,143" fill="#CBD5E1" stroke="#F8FAFC" strokeWidth="1" />
                      <polygon points="145,125 185,143 185,168 145,150" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                      <polygon points="185,143 345,70 345,95 185,168" fill="#64748B" stroke="#94A3B8" strokeWidth="1" />
                    </svg>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Trabalhamos com aço carbono certificado nas bitolas mais exigidas por serralheiros, engenheiros e construtoras do Litoral Norte e Agreste Baiano.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block">ENDEREÇO</span>
                    <span className="text-white font-semibold mt-0.5 block">
                      Rua da Leste, 01 · Centro
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ATENDIMENTO DIRETO</span>
                    <span className="text-amber-400 font-semibold mt-0.5 block">
                      {BUSINESS_INFO.phoneDisplay}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-Width 4-Column Operational Proof Strip Below Hero Split */}
            <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                  6.000 mm
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Barras padrão e fracionamento em serra de fita em 45° e 90°
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 tabular-nums">
                  ±0,5 mm
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Precisão dimensional em corte guilhotina e dobra de chapas
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                  Até 24h
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Expedição rápida para Alagoinhas, Catu, Aramari e Pojuca
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                  100% ABNT
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Aço estrutural ASTM A36, SAE 1020 e NBR 6591 com parede real
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: CATÁLOGO DE PRODUTOS INTERATIVO */}
        <section
          id="catalogo"
          aria-labelledby="heading-catalogo"
          className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-amber-700">
                Catálogo Técnico de Ferro e Aço · Pronta Entrega
              </p>
              <h2
                id="heading-catalogo"
                className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
                style={{ textWrap: 'balance' }}
              >
                Selecione as Bitolas e Monte Seu Orçamento Instantâneo
              </h2>
              <p className="mt-2 text-base text-slate-600 max-w-2xl">
                Escolha a especificação de parede/chapa em cada produto para conferir o peso por barra e adicionar à sua lista de cotação via WhatsApp.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full lg:w-80">
              <label htmlFor="catalog-search" className="sr-only">
                Buscar material ou bitola
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="catalog-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar ex: 50x30, chapa xadrez, TP40..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
                />
              </div>
            </div>
          </div>

          {/* Interactive Category Filter Bar (Segmented Controls) */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div
              role="tablist"
              aria-label="Filtrar categoria de aço"
              className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/75 rounded-xl"
            >
              {CATEGORY_FILTERS.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-mono text-slate-500 tabular-nums">
              Exibindo {filteredProducts.length} de {CATALOG_PRODUCTS.length} linhas de produtos
            </div>
          </div>

          {/* Product Grid (3 Columns on Desktop) */}
          {filteredProducts.length === 0 ? (
            <div className="mt-10 p-12 text-center bg-white border border-slate-200 rounded-xl">
              <p className="text-base font-semibold text-slate-900">
                Nenhum material encontrado para &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Tente buscar por outra medida (ex: 30x20, 100x40, galvalume, cantoneira) ou limpe os filtros.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('todos');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Mostrar Todos os Materiais
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => {
                const activeVariantId =
                  selectedVariants[product.id] || product.variants[0].id;
                const activeVariant =
                  product.variants.find((v) => v.id === activeVariantId) ||
                  product.variants[0];
                const currentQty = cardQuantities[product.id] || 1;
                const isAdded = recentlyAddedId === product.id;

                return (
                  <article
                    key={product.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Technical Illustration Header */}
                      <ProductTechnicalIllustration
                        type={product.illustrationType}
                        sku={product.sku}
                      />

                      <div className="p-6">
                        {/* Clean Unboxed Metadata */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                          <span className="uppercase text-amber-700 font-semibold">
                            {product.categoryLabel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{product.stockStatus}</span>
                        </div>

                        <h3 className="mt-1.5 text-lg font-bold text-slate-900 leading-snug">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-xs font-mono text-slate-500">
                          {product.normSpec}
                        </p>

                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                          {product.shortDescription}
                        </p>

                        {/* Variant Selector */}
                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <label
                            htmlFor={`variant-select-${product.id}`}
                            className="block text-xs font-semibold text-slate-700"
                          >
                            Selecionar Bitola / Espessura:
                          </label>
                          <select
                            id={`variant-select-${product.id}`}
                            value={activeVariant.id}
                            onChange={(e) =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [product.id]: e.target.value,
                              }))
                            }
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-[#F8FAFC] px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:border-amber-600 focus:outline-none"
                          >
                            {product.variants.map((variant) => (
                              <option key={variant.id} value={variant.id}>
                                {variant.label}
                              </option>
                            ))}
                          </select>

                          {/* Selected Variant Telemetry */}
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 font-mono tabular-nums bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/70">
                            <span>
                              Peso: <strong>{activeVariant.weightKg.toFixed(2).replace('.', ',')} kg</strong>/{activeVariant.unitLabel}
                            </span>
                            <span>
                              Esp: <strong>{activeVariant.thicknessMm} mm</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Purchase / Quote Footer */}
                    <div className="px-6 pb-6 pt-3 border-t border-slate-100 bg-white">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="text-xs text-slate-500 block">
                            Preço de referência ({activeVariant.unitLabel})
                          </span>
                          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                            R$ {activeVariant.unitPriceBrl.toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <label
                            htmlFor={`qty-${product.id}`}
                            className="text-xs text-slate-600"
                          >
                            Qtd:
                          </label>
                          <input
                            id={`qty-${product.id}`}
                            type="number"
                            min={1}
                            max={500}
                            value={currentQty}
                            onChange={(e) =>
                              setCardQuantities((prev) => ({
                                ...prev,
                                [product.id]: Math.max(1, Number(e.target.value) || 1),
                              }))
                            }
                            className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-center font-mono text-xs font-semibold text-slate-900 tabular-nums"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddProductToQuote(product)}
                        className={`w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap ${
                          isAdded
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Adicionado à Cotação</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4 text-amber-400" />
                            <span>Adicionar à Cotação</span>
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: SERVIÇOS ESPECIALIZADOS & CALCULADORA DE CORTE/PESO */}
        <section
          id="servicos"
          aria-labelledby="heading-servicos"
          className="py-20 bg-white border-t border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-mono uppercase tracking-wider text-amber-700">
                Beneficiamento de Aço em Alagoinhas
              </p>
              <h2
                id="heading-servicos"
                className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
                style={{ textWrap: 'balance' }}
              >
                Serviços Especializados de Corte, Dobra e Calandragem
              </h2>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Além da distribuição de ferro e aço a pronta entrega, nossa metalúrgica entrega peças já cortadas, dobradas e calandradas nas medidas exatas do seu projeto.
              </p>
            </div>

            {/* Asymmetric Bento Grid: 4 Numbered Services Left + Interactive Cut/Weight Calculator Right */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Services List (7 columns) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {SPECIALIZED_SERVICES.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-6 rounded-xl border border-slate-200 bg-[#F8FAFC] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                        <span className="text-sm font-bold text-amber-700">
                          {srv.indexNumber}
                        </span>
                        <span>{srv.leadTime}</span>
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">
                        {srv.title}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {srv.subtitle}
                      </p>
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2">
                      <p className="text-xs font-mono text-slate-600">
                        {srv.capacitySpec} · {srv.toleranceSpec}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCutSpec((prev) => ({
                            ...prev,
                            materialType: srv.defaultProfileType,
                          }));
                        }}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Simular medida na calculadora ao lado →</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Steel Cut & Weight Calculator (5 columns) */}
              <div className="lg:col-span-5 rounded-xl bg-[#0F172A] text-white p-6 sm:p-8 border border-slate-800">
                <div className="flex items-center gap-2.5 text-amber-400 text-xs font-mono uppercase tracking-wider">
                  <Calculator className="w-4 h-4" />
                  <span>Calculadora Técnica de Corte e Peso</span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Simule Peças Cortadas ou Dobradas Sob Medida
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-300">
                  Calcule o peso teórico (densidade do aço 7,85 g/cm³) e adicione o serviço diretamente ao seu orçamento.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="calc-material-type"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      Tipo de Beneficiamento
                    </label>
                    <select
                      id="calc-material-type"
                      value={cutSpec.materialType}
                      onChange={(e) =>
                        setCutSpec((prev) => ({
                          ...prev,
                          materialType: e.target.value as CustomCutSpec['materialType'],
                        }))
                      }
                      className="mt-1.5 w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="chapa">Chapa de Aço Cortada / Dobrada</option>
                      <option value="perfil">Perfil U Especial Sob Medida</option>
                      <option value="tubo">Tubo Cortado em Serra de Fita</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="calc-thickness"
                        className="block text-xs font-semibold text-slate-300"
                      >
                        Espessura (mm)
                      </label>
                      <input
                        id="calc-thickness"
                        type="number"
                        step="0.25"
                        min="0.5"
                        max="25"
                        value={cutSpec.thicknessMm}
                        onChange={(e) =>
                          setCutSpec((prev) => ({
                            ...prev,
                            thicknessMm: Number(e.target.value) || 1.2,
                          }))
                        }
                        className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm font-mono text-white tabular-nums"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="calc-width"
                        className="block text-xs font-semibold text-slate-300"
                      >
                        Largura (mm)
                      </label>
                      <input
                        id="calc-width"
                        type="number"
                        step="10"
                        min="20"
                        max="3000"
                        value={cutSpec.widthMm}
                        onChange={(e) =>
                          setCutSpec((prev) => ({
                            ...prev,
                            widthMm: Number(e.target.value) || 100,
                          }))
                        }
                        className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm font-mono text-white tabular-nums"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="calc-length"
                        className="block text-xs font-semibold text-slate-300"
                      >
                        Compr. (mm)
                      </label>
                      <input
                        id="calc-length"
                        type="number"
                        step="50"
                        min="50"
                        max="6000"
                        value={cutSpec.lengthMm}
                        onChange={(e) =>
                          setCutSpec((prev) => ({
                            ...prev,
                            lengthMm: Number(e.target.value) || 1000,
                          }))
                        }
                        className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm font-mono text-white tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center pt-1">
                    <div>
                      <label
                        htmlFor="calc-qty"
                        className="block text-xs font-semibold text-slate-300"
                      >
                        Quantidade de Peças
                      </label>
                      <input
                        id="calc-qty"
                        type="number"
                        min="1"
                        max="500"
                        value={cutSpec.quantity}
                        onChange={(e) =>
                          setCutSpec((prev) => ({
                            ...prev,
                            quantity: Math.max(1, Number(e.target.value) || 1),
                          }))
                        }
                        className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm font-mono text-white tabular-nums"
                      />
                    </div>

                    <div className="pt-5">
                      <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-200 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={cutSpec.includeBending}
                          onChange={(e) =>
                            setCutSpec((prev) => ({
                              ...prev,
                              includeBending: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                        />
                        <span>Incluir Dobra CNC</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Calculator Output Box */}
                <div className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs sm:text-sm tabular-nums">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Peso Unitário Estimado:</span>
                    <span className="text-white font-semibold">
                      {cutCalculation.unitWeightKg.toFixed(2).replace('.', ',')} kg/peça
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Peso Total do Lote ({cutSpec.quantity} un):</span>
                    <span className="text-white font-semibold">
                      {cutCalculation.totalWeightKg.toFixed(2).replace('.', ',')} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm">
                    <span className="text-slate-300 font-sans font-semibold">
                      Estimativa Corte/Aço:
                    </span>
                    <span className="text-amber-400 font-bold text-base">
                      R$ {cutCalculation.estimatedPriceBrl.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomCutToQuote}
                  className="mt-5 w-full py-3 px-4 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <PlusIcon />
                  <span>Incluir Peça Sob Medida na Cotação</span>
                </button>

                {customCutAddedBanner && (
                  <p
                    role="status"
                    className="mt-3 text-xs text-center text-emerald-400 font-medium"
                  >
                    Especificação de corte adicionada à sua Lista de Cotação e ao formulário!
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: DEPOIMENTOS DE CLIENTES (Claim-to-Proof Adjacency) */}
        <section
          id="depoimentos"
          aria-labelledby="heading-depoimentos"
          className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-amber-700">
                Resultados Comprovados na Região de Alagoinhas
              </p>
              <h2
                id="heading-depoimentos"
                className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
                style={{ textWrap: 'balance' }}
              >
                Quem Constrói e Fabrica em Alagoinhas Confia na Guerreiro
              </h2>
            </div>

            {/* Interactive Sector Filter */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/75 rounded-lg">
              {['Todos', 'Serralheria', 'Construção Civil', 'Indústria & Agro'].map(
                (sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => setTestimonialSector(sector)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      testimonialSector === sector
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sector}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredTestimonials.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span className="text-amber-700 font-semibold">{item.sector}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.city}</span>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-900 bg-slate-100 px-3 py-2 rounded-lg">
                    Resultado: {item.metricOutcome}
                  </p>

                  <blockquote className="mt-4 text-sm text-slate-700 leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{item.clientName}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {item.role} · {item.company}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    {item.projectDelivered}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 4: MAPA DE LOCALIZAÇÃO INTERATIVO & LOGÍSTICA */}
        <LocationMapSection />

        {/* SECTION 5: FORMULÁRIO DE CONTATO & ORÇAMENTO RÁPIDO */}
        <section
          id="contato"
          aria-labelledby="heading-contato"
          className="py-20 bg-[#0F172A] text-white border-t border-slate-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Direct Channels & Quote Summary */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-amber-400">
                    Central de Cotações · Alagoinhas - BA
                  </p>
                  <h2
                    id="heading-contato"
                    className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white"
                    style={{ textWrap: 'balance' }}
                  >
                    Solicite Seu Orçamento Formal ou Envie Direto no WhatsApp
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                    Preencha seus dados e a descrição das ferragens ou chapas que precisa. Nossa equipe comercial responde rapidamente com valores atualizados, prazo de corte e condições de entrega.
                  </p>
                </div>

                {/* Live Summary of Selected Catalog Items */}
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      Resumo da Sua Lista Atual
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className="text-xs font-semibold text-amber-400 hover:underline"
                    >
                      Editar itens ({cartTotals.totalUnits})
                    </button>
                  </div>

                  {cart.length === 0 ? (
                    <p className="text-xs text-slate-400 mt-2">
                      Nenhum item do catálogo anexado ainda. Você pode digitar sua lista livremente no campo de observações ao lado ou selecionar produtos no catálogo acima.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2 text-xs">
                      <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-slate-300">
                        {cart.map((item) => (
                          <li
                            key={`${item.productId}-${item.variantId}`}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="truncate">
                              {item.quantity}x {item.productName} ({item.variantLabel})
                            </span>
                            <span className="font-mono text-amber-400 shrink-0 tabular-nums">
                              R$ {(item.unitPriceBrl * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-xs text-white tabular-nums">
                        <span>Peso Total: {cartTotals.totalWeightKg.toFixed(2).replace('.', ',')} kg</span>
                        <span className="text-amber-400 font-bold">
                          Total Est.: R$ {cartTotals.estimatedTotalBrl.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Contact Metadata */}
                <div className="space-y-3 pt-2 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Telefone / WhatsApp Direto:{' '}
                      <strong className="text-white font-mono">{BUSINESS_INFO.phoneDisplay}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{BUSINESS_INFO.fullAddress}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Validated Lead Capture & Quote Form */}
              <div className="lg:col-span-7 bg-white text-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200">
                {submittedQuote ? (
                  <div
                    role="region"
                    aria-label="Confirmação de Orçamento"
                    className="py-6 space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-mono uppercase text-emerald-700 font-semibold">
                          Protocolo #{submittedQuote.protocol} · Registrado às {submittedQuote.timestamp}
                        </p>
                        <h3 className="text-xl font-bold text-slate-900">
                          Solicitação de Orçamento Pronta para Envio!
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      Obrigado, <strong>{submittedQuote.customerName}</strong> ({submittedQuote.customerType} — {submittedQuote.city}). Estruturamos seu pedido técnico com todos os itens e medidas solicitadas.
                    </p>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono text-slate-700 tabular-nums">
                      <div className="flex justify-between">
                        <span>UNIDADES DO CATÁLOGO:</span>
                        <span className="font-semibold text-slate-900">{submittedQuote.itemsCount} un</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PESO BRUTO ESTIMADO:</span>
                        <span className="font-semibold text-slate-900">
                          {submittedQuote.totalWeightKg.toFixed(2).replace('.', ',')} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>SUBTOTAL DE REFERÊNCIA:</span>
                        <span className="font-semibold text-amber-700">
                          R$ {submittedQuote.estimatedTotalBrl.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <a
                        href={submittedQuote.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Abrir Conversa no WhatsApp com o Pedido</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setSubmittedQuote(null)}
                        className="w-full sm:w-auto py-3.5 px-5 rounded-lg text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors whitespace-nowrap"
                      >
                        Editar Solicitação
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} noValidate className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="input-fullname"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Nome Completo ou Responsável *
                        </label>
                        <input
                          id="input-fullname"
                          type="text"
                          required
                          value={contactInput.fullName}
                          onChange={(e) =>
                            setContactInput((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                          placeholder="Ex: João Batista / Serralheria Silva"
                          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:outline-none"
                        />
                        {formErrors.fullName && (
                          <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
                            {formErrors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="input-phone"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          WhatsApp / Telefone com DDD *
                        </label>
                        <input
                          id="input-phone"
                          type="tel"
                          required
                          value={contactInput.phone}
                          onChange={(e) =>
                            setContactInput((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          placeholder="(75) 99925-4235"
                          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:border-amber-600 focus:outline-none"
                        />
                        {formErrors.phone && (
                          <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
                            {formErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label
                          htmlFor="input-customer-type"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Perfil de Cliente
                        </label>
                        <select
                          id="input-customer-type"
                          value={contactInput.customerType}
                          onChange={(e) =>
                            setContactInput((prev) => ({
                              ...prev,
                              customerType: e.target.value as ContactFormInput['customerType'],
                            }))
                          }
                          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:outline-none"
                        >
                          <option value="Serralheria">Serralheria</option>
                          <option value="Construtora">Construtora / Eng.</option>
                          <option value="Indústria">Indústria / Manutenção</option>
                          <option value="Particular">Obra Particular</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="input-city"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Cidade da Obra *
                        </label>
                        <input
                          id="input-city"
                          type="text"
                          required
                          value={contactInput.city}
                          onChange={(e) =>
                            setContactInput((prev) => ({ ...prev, city: e.target.value }))
                          }
                          placeholder="Alagoinhas - BA"
                          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:outline-none"
                        />
                        {formErrors.city && (
                          <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
                            {formErrors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="input-delivery"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Modalidade
                        </label>
                        <select
                          id="input-delivery"
                          value={contactInput.deliveryPreference}
                          onChange={(e) =>
                            setContactInput((prev) => ({
                              ...prev,
                              deliveryPreference:
                                e.target.value as ContactFormInput['deliveryPreference'],
                            }))
                          }
                          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:outline-none"
                        >
                          <option value="Entrega em Obra / Oficina">
                            Entrega em Obra / Oficina
                          </option>
                          <option value="Retirada no Galpão (Centro)">
                            Retirada no Galpão (Centro)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="input-email"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        E-mail para Nota Fiscal / Proposta PDF (Opcional)
                      </label>
                      <input
                        id="input-email"
                        type="email"
                        value={contactInput.email}
                        onChange={(e) =>
                          setContactInput((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="compras@suaempresa.com.br"
                        className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:outline-none"
                      />
                      {formErrors.email && (
                        <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="input-notes"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Descrição dos Materiais, Quantidades ou Cortes Sob Medida *
                      </label>
                      <textarea
                        id="input-notes"
                        rows={4}
                        required
                        value={contactInput.projectNotes}
                        onChange={(e) =>
                          setContactInput((prev) => ({
                            ...prev,
                            projectNotes: e.target.value,
                          }))
                        }
                        placeholder="Ex: Preciso de 12 barras de Metalon 50x30 chapa 16, 4 chapas xadrez 1/8 e corte de 20 degraus dobrados..."
                        className="mt-1.5 w-full rounded-lg border border-slate-300 p-3.5 text-sm text-slate-900 focus:border-amber-600 focus:outline-none"
                      />
                      {formErrors.projectNotes && (
                        <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
                          {formErrors.projectNotes}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3.5 rounded-lg text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <span>Gerar Cotação e Enviar Pedido</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <span className="text-xs text-slate-500">
                        Atendimento direto pelo setor comercial de Alagoinhas.
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-base font-bold text-white font-display">
              {BUSINESS_INFO.name}
            </p>
            <p className="mt-1">
              {BUSINESS_INFO.fullAddress} · Tel/WhatsApp: {BUSINESS_INFO.phoneDisplay}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#catalogo" className="hover:text-white transition-colors">
              Catálogo
            </a>
            <a href="#servicos" className="hover:text-white transition-colors">
              Serviços
            </a>
            <a href="#depoimentos" className="hover:text-white transition-colors">
              Depoimentos
            </a>
            <a href="#localizacao" className="hover:text-white transition-colors">
              Mapa
            </a>
            <a href="#contato" className="hover:text-white transition-colors">
              Orçamento
            </a>
          </div>
        </div>
      </footer>

      {/* Quote Drawer Modal */}
      <QuoteDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onClearCart={() => setCart([])}
        onProceedToForm={() => scrollToSection('contato')}
      />
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
