export type ProductCategory =
  | 'todos'
  | 'tubos-metalon'
  | 'chapas-aco'
  | 'perfis-estruturais'
  | 'telhas-coberturas'
  | 'serralheria-acessorios';

export interface ProductVariant {
  id: string;
  label: string;
  dimensions: string;
  thicknessMm: number;
  weightKg: number;
  unitPriceBrl: number;
  unitLabel: string;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  category: Exclude<ProductCategory, 'todos'>;
  categoryLabel: string;
  normSpec: string;
  shortDescription: string;
  application: string;
  stockStatus: 'Pronta Entrega' | 'Sob Medida';
  illustrationType: 'metalon' | 'chapa-xadrez' | 'perfil-u' | 'telha-galvalume' | 'cantoneira' | 'acessorios';
  variants: ProductVariant[];
}

export interface SpecializedService {
  id: string;
  indexNumber: string;
  title: string;
  subtitle: string;
  description: string;
  capacitySpec: string;
  toleranceSpec: string;
  leadTime: string;
  defaultProfileType: 'chapa' | 'tubo' | 'perfil';
}

export interface CustomerTestimonial {
  id: string;
  clientName: string;
  role: string;
  company: string;
  city: string;
  sector: 'Serralheria' | 'Construção Civil' | 'Indústria & Agro';
  projectDelivered: string;
  quote: string;
  metricOutcome: string;
  dateLabel: string;
}

export const BUSINESS_INFO = {
  name: 'Guerreiro Ferro e Aço',
  legalRegion: 'Alagoinhas — Bahia',
  addressStreet: 'Rua da Leste, 01 - Galpão',
  addressDistrict: 'Centro, Alagoinhas - BA',
  postalCode: '48000-165',
  fullAddress: 'Rua da Leste, 01 - Galpão - Centro, Alagoinhas - BA, 48000-165',
  phoneDisplay: '(75) 99925-4235',
  whatsappNumber: '5575999254235',
  coordinates: {
    lat: -12.1366508,
    lng: -38.4253483,
  },
  googleMapsPlaceUrl:
    'https://www.google.com/maps/place/GUERREIRO+FERRO+E+A%C3%87O+ALAGOINHAS/@-12.1366508,-38.4253483,16z',
  openingHours: 'Seg a Sex: 07h30 às 17h30 · Sáb: 07h30 às 12h30',
};

export const CATEGORY_FILTERS: { id: ProductCategory; label: string }[] = [
  { id: 'todos', label: 'Todos os Materiais' },
  { id: 'tubos-metalon', label: 'Tubos Metalon' },
  { id: 'chapas-aco', label: 'Chapas de Aço' },
  { id: 'perfis-estruturais', label: 'Perfis e Vigas' },
  { id: 'telhas-coberturas', label: 'Telhas Galvalume' },
  { id: 'serralheria-acessorios', label: 'Serralheria e Barras' },
];

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'metalon-retangular-galv',
    sku: 'GFA-MET-01',
    name: 'Tubo Metalon Retangular e Quadrado',
    category: 'tubos-metalon',
    categoryLabel: 'Tubos Metalon',
    normSpec: 'NBR 6591 · Aço Carbono / Galvanizado',
    shortDescription:
      'Tubos estruturais de seção quadrada e retangular em barras de 6 metros com costura de alta precisão para portões, coberturas e estruturas metálicas.',
    application: 'Portões basculantes, grades industriais, pergolados e estruturas de telhado',
    stockStatus: 'Pronta Entrega',
    illustrationType: 'metalon',
    variants: [
      {
        id: 'met-20x20-18',
        label: '20 x 20 mm · Chapa 18 (1,20 mm)',
        dimensions: '20x20mm · 6m',
        thicknessMm: 1.2,
        weightKg: 4.32,
        unitPriceBrl: 48.9,
        unitLabel: 'barra 6m',
      },
      {
        id: 'met-30x20-18',
        label: '30 x 20 mm · Chapa 18 (1,20 mm)',
        dimensions: '30x20mm · 6m',
        thicknessMm: 1.2,
        weightKg: 5.45,
        unitPriceBrl: 62.5,
        unitLabel: 'barra 6m',
      },
      {
        id: 'met-50x30-16',
        label: '50 x 30 mm · Chapa 16 (1,50 mm)',
        dimensions: '50x30mm · 6m',
        thicknessMm: 1.5,
        weightKg: 11.1,
        unitPriceBrl: 118.0,
        unitLabel: 'barra 6m',
      },
      {
        id: 'met-100x40-14',
        label: '100 x 40 mm · Chapa 14 (2,00 mm)',
        dimensions: '100x40mm · 6m',
        thicknessMm: 2.0,
        weightKg: 25.8,
        unitPriceBrl: 264.0,
        unitLabel: 'barra 6m',
      },
    ],
  },
  {
    id: 'chapa-xadrez-piso',
    sku: 'GFA-CHP-02',
    name: 'Chapa de Aço Xadrez e Lisa Industrial',
    category: 'chapas-aco',
    categoryLabel: 'Chapas de Aço',
    normSpec: 'ASTM A36 / SAE 1020 · Antiderrapante e Lisa',
    shortDescription:
      'Chapas de piso antiderrapantes (relevo lentilha) e chapas finas a frio/quente ou galvanizadas para mezaninos, escadas metálicas e carrocerias.',
    application: 'Pisos industriais, degraus de escada, rampas de carga e fechamento',
    stockStatus: 'Pronta Entrega',
    illustrationType: 'chapa-xadrez',
    variants: [
      {
        id: 'chp-lisa-18',
        label: 'Chapa Lisa Galv. #18 (1,20 mm) · 2,00 x 1,20 m',
        dimensions: '2000x1200mm',
        thicknessMm: 1.2,
        weightKg: 22.6,
        unitPriceBrl: 245.0,
        unitLabel: 'chapa',
      },
      {
        id: 'chp-lisa-14',
        label: 'Chapa Preta #14 (2,00 mm) · 2,00 x 1,20 m',
        dimensions: '2000x1200mm',
        thicknessMm: 2.0,
        weightKg: 37.6,
        unitPriceBrl: 389.0,
        unitLabel: 'chapa',
      },
      {
        id: 'chp-xadrez-1-8',
        label: 'Chapa Xadrez 1/8" (3,00 mm) · 2,00 x 1,20 m',
        dimensions: '2000x1200mm',
        thicknessMm: 3.0,
        weightKg: 59.5,
        unitPriceBrl: 615.0,
        unitLabel: 'chapa',
      },
      {
        id: 'chp-xadrez-3-16',
        label: 'Chapa Xadrez 3/16" (4,75 mm) · 2,00 x 1,20 m',
        dimensions: '2000x1200mm',
        thicknessMm: 4.75,
        weightKg: 91.2,
        unitPriceBrl: 940.0,
        unitLabel: 'chapa',
      },
    ],
  },
  {
    id: 'perfil-u-estrutural',
    sku: 'GFA-PRF-03',
    name: 'Perfil U Simples e Enrijecido para Galpão',
    category: 'perfis-estruturais',
    categoryLabel: 'Perfis e Vigas',
    normSpec: 'NBR 6355 · Aço Estrutural ASTM A36',
    shortDescription:
      'Perfis dobrados a frio simples e enrijecidos ideais para terças de cobertura, tesouras metálicas, colunas e vigamento de galpões comerciais.',
    application: 'Coberturas de galpões, terças metálicas, mezaninos e pórticos',
    stockStatus: 'Pronta Entrega',
    illustrationType: 'perfil-u',
    variants: [
      {
        id: 'prf-u-75x40-200',
        label: 'Perfil U Simples 75 x 40 mm · Chapa 14 (2,00 mm)',
        dimensions: '75x40mm · 6m',
        thicknessMm: 2.0,
        weightKg: 14.2,
        unitPriceBrl: 146.0,
        unitLabel: 'barra 6m',
      },
      {
        id: 'prf-ue-100x40-200',
        label: 'Perfil U Enrijecido 100 x 40 x 17 mm · Chapa 14 (2,00 mm)',
        dimensions: '100x40x17mm · 6m',
        thicknessMm: 2.0,
        weightKg: 19.3,
        unitPriceBrl: 198.0,
        unitLabel: 'barra 6m',
      },
      {
        id: 'prf-ue-127x50-265',
        label: 'Perfil U Enrijecido 127 x 50 x 17 mm · Chapa 12 (2,65 mm)',
        dimensions: '127x50x17mm · 6m',
        thicknessMm: 2.65,
        weightKg: 31.4,
        unitPriceBrl: 319.0,
        unitLabel: 'barra 6m',
      },
      {
        id: 'prf-ue-150x60-300',
        label: 'Perfil U Enrijecido 150 x 60 x 20 mm · Chapa 11 (3,00 mm)',
        dimensions: '150x60x20mm · 6m',
        thicknessMm: 3.0,
        weightKg: 42.6,
        unitPriceBrl: 435.0,
        unitLabel: 'barra 6m',
      },
    ],
  },
  {
    id: 'telha-galvalume-trapezoidal',
    sku: 'GFA-TLH-04',
    name: 'Telha Metálica Galvalume TP40 / TP25',
    category: 'telhas-coberturas',
    categoryLabel: 'Telhas Galvalume',
    normSpec: 'NBR 14514 · Revestimento AZ150 (Alumínio-Zinco)',
    shortDescription:
      'Telhas trapezoidais em aço Galvalume com elevada resistência contra corrosão e reflexão térmica, cortadas sob medida para sua obra em Alagoinhas.',
    application: 'Coberturas industriais, comerciais, residenciais e fechamento lateral',
    stockStatus: 'Sob Medida',
    illustrationType: 'telha-galvalume',
    variants: [
      {
        id: 'tlh-tp40-043-3m',
        label: 'Telha Galvalume TP40 · Esp. 0,43 mm · Comp. 3,00 m',
        dimensions: '3000x1020mm',
        thicknessMm: 0.43,
        weightKg: 11.8,
        unitPriceBrl: 138.0,
        unitLabel: 'peça 3m',
      },
      {
        id: 'tlh-tp40-043-6m',
        label: 'Telha Galvalume TP40 · Esp. 0,43 mm · Comp. 6,00 m',
        dimensions: '6000x1020mm',
        thicknessMm: 0.43,
        weightKg: 23.6,
        unitPriceBrl: 276.0,
        unitLabel: 'peça 6m',
      },
      {
        id: 'tlh-tp40-050-6m',
        label: 'Telha Galvalume TP40 · Esp. 0,50 mm · Comp. 6,00 m',
        dimensions: '6000x1020mm',
        thicknessMm: 0.5,
        weightKg: 27.4,
        unitPriceBrl: 318.0,
        unitLabel: 'peça 6m',
      },
      {
        id: 'tlh-cumeeira-padrao',
        label: 'Cumeeira Trapezoidal Galvalume · Peça 2,00 m',
        dimensions: '2000x400mm',
        thicknessMm: 0.43,
        weightKg: 4.2,
        unitPriceBrl: 69.0,
        unitLabel: 'peça 2m',
      },
    ],
  },
  {
    id: 'cantoneiras-barras-chatas',
    sku: 'GFA-CNT-05',
    name: 'Cantoneiras Laminadas e Barras Chatas',
    category: 'serralheria-acessorios',
    categoryLabel: 'Serralheria e Barras',
    normSpec: 'ASTM A36 / SAE 1020 · Laminados a Quente',
    shortDescription:
      'Cantoneiras de abas iguais, barras chatas e ferros redondos maciços para grades de segurança, esquadrias, torres e reforços estruturais.',
    application: 'Grades, mão-francesa, suportes industriais, trilhos e serralheria artística',
    stockStatus: 'Pronta Entrega',
    illustrationType: 'cantoneira',
    variants: [
      {
        id: 'cnt-3-4-1-8',
        label: 'Cantoneira 3/4" x 1/8" (19 x 3,18 mm) · Barra 6m',
        dimensions: '19x3.18mm · 6m',
        thicknessMm: 3.18,
        weightKg: 5.34,
        unitPriceBrl: 58.0,
        unitLabel: 'barra 6m',
      },
      {
        id: 'cnt-1-1-8',
        label: 'Cantoneira 1" x 1/8" (25,4 x 3,18 mm) · Barra 6m',
        dimensions: '25.4x3.18mm · 6m',
        thicknessMm: 3.18,
        weightKg: 7.26,
        unitPriceBrl: 76.0,
        unitLabel: 'barra 6m',
      },
      {
        id: 'cnt-1-1-2-3-16',
        label: 'Cantoneira 1.1/2" x 3/16" (38 x 4,75 mm) · Barra 6m',
        dimensions: '38x4.75mm · 6m',
        thicknessMm: 4.75,
        weightKg: 16.3,
        unitPriceBrl: 168.0,
        unitLabel: 'barra 6m',
      },
      {
        id: 'bch-1-1-8',
        label: 'Barra Chata 1" x 1/8" (25,4 x 3,18 mm) · Barra 6m',
        dimensions: '25.4x3.18mm · 6m',
        thicknessMm: 3.18,
        weightKg: 3.84,
        unitPriceBrl: 42.0,
        unitLabel: 'barra 6m',
      },
    ],
  },
  {
    id: 'kit-serralheria-consumiveis',
    sku: 'GFA-ACS-06',
    name: 'Roldanas, Discos de Corte, Eletrodos e Fechaduras',
    category: 'serralheria-acessorios',
    categoryLabel: 'Serralheria e Barras',
    normSpec: 'Linha Profissional para Serralheiro',
    shortDescription:
      'Linha completa de insumos de alta rotação para serralheria: roldanas em aço com rolamento blindado, eletrodos E6013/E7018, discos flap e gonzo.',
    application: 'Montagem de portões deslizantes, soldagem estrutural e acabamento',
    stockStatus: 'Pronta Entrega',
    illustrationType: 'acessorios',
    variants: [
      {
        id: 'acs-roldana-3pol',
        label: 'Par de Roldanas Aço Canal V 3" (75 mm) c/ Caixa',
        dimensions: 'Ø 75mm · Canal V',
        thicknessMm: 18.0,
        weightKg: 1.4,
        unitPriceBrl: 54.0,
        unitLabel: 'par',
      },
      {
        id: 'acs-eletrodo-6013-5kg',
        label: 'Caixa Eletrodo E6013 2,50 mm · Pacote Fechado 5 kg',
        dimensions: '2.50mm · 5kg',
        thicknessMm: 2.5,
        weightKg: 5.0,
        unitPriceBrl: 98.0,
        unitLabel: 'caixa 5kg',
      },
      {
        id: 'acs-disco-corte-kit10',
        label: 'Kit 10 Discos de Corte Fino Inox/Aço 4.1/2" x 1,0 mm',
        dimensions: '115x1.0x22.2mm',
        thicknessMm: 1.0,
        weightKg: 0.45,
        unitPriceBrl: 39.9,
        unitLabel: 'kit 10 un',
      },
      {
        id: 'acs-trilho-portao-6m',
        label: 'Perfil Trilho Redondo p/ Portão Deslizante · Barra 6m',
        dimensions: '5/8" · 6m',
        thicknessMm: 2.0,
        weightKg: 7.8,
        unitPriceBrl: 89.0,
        unitLabel: 'barra 6m',
      },
    ],
  },
];

export const SPECIALIZED_SERVICES: SpecializedService[] = [
  {
    id: 'corte-dobra-guilhotina',
    indexNumber: '01.',
    title: 'Corte em Guilhotina e Dobra de Chapas',
    subtitle: 'Chapas sob medida até 6,35 mm (1/4") com esquadro rigoroso',
    description:
      'Executamos cortes retos em guilhotina hidráulica e dobras de perfis especiais (calhas, rufos, degraus de escada, bandejas e perfis U fora de padrão) conforme desenho técnico do seu projeto.',
    capacitySpec: 'Comprimento até 3.000 mm · Espessura até 6,35 mm',
    toleranceSpec: 'Tolerância dimensional ±0,5 mm',
    leadTime: 'Entrega em até 24h úteis',
    defaultProfileType: 'chapa',
  },
  {
    id: 'corte-serra-fita-esquadria',
    indexNumber: '02.',
    title: 'Corte Preciso em Serra de Fita (45° e 90°)',
    subtitle: 'Tubos, vigas e barras cortados no comprimento exato da sua lista',
    description:
      'Reduza o desperdício de pontas na sua oficina ou obra. Entregamos pacotes de tubos Metalon, vigas U e cantoneiras já fracionados em ângulos retos ou meia-esquadria prontos para ponteamento.',
    capacitySpec: 'Seções até 250 mm · Cortes seriados em feixe',
    toleranceSpec: 'Esquadria calibrada de 0° a 60°',
    leadTime: 'Retirada no mesmo dia',
    defaultProfileType: 'tubo',
  },
  {
    id: 'calandragem-curvamento',
    indexNumber: '03.',
    title: 'Calandragem de Tubos, Perfis e Chapas',
    subtitle: 'Arcos para galpões, coberturas curvas e reservatórios',
    description:
      'Curvamento simétrico de tubos redondos, quadrados, barras chatas e cantoneiras sem esmagamento de parede, garantindo estética limpa e resistência estrutural para coberturas em arco.',
    capacitySpec: 'Tubos até 3" e Perfis U até 127 mm',
    toleranceSpec: 'Raio uniforme por gabarito',
    leadTime: '24h a 48h úteis',
    defaultProfileType: 'perfil',
  },
  {
    id: 'logistica-alagoinhas-regiao',
    indexNumber: '04.',
    title: 'Frota Própria para Barras de 6m em Alagoinhas e Região',
    subtitle: 'Despacho direto do Centro de Alagoinhas para sua obra ou serralheria',
    description:
      'Caminhões equipados com suporte porta-ferro para transporte seguro de barras de 6 metros, chapas inteiras e telhas longas sem empeno, atendendo Alagoinhas, Catu, Pojuca, Aramari, Inhambupe e Entre Rios.',
    capacitySpec: 'Cargas fracionadas ou fechadas até 6 toneladas',
    toleranceSpec: 'Descarga organizada no canteiro',
    leadTime: 'Rota diária em Alagoinhas',
    defaultProfileType: 'perfil',
  },
];

export const CUSTOMER_TESTIMONIALS: CustomerTestimonial[] = [
  {
    id: 'test-1',
    clientName: 'Carlos Eduardo Santana',
    role: 'Proprietário e Mestre Serralheiro',
    company: 'Serralheria Forte Aço',
    city: 'Alagoinhas, BA',
    sector: 'Serralheria',
    projectDelivered: 'Fornecimento contínuo de Metalon galvanizado e chapas dobradas',
    quote:
      'Antes a gente perdia quase uma manhã inteira esperando material ou corrigindo chapa fora de esquadro. Na Guerreiro Ferro e Aço eu mando a lista no WhatsApp cedo, o corte e dobra já vêm cravados na medida e o caminhão entrega na porta da oficina no mesmo dia.',
    metricOutcome: 'Redução de 40% no tempo de montagem de portões basculantes',
    dateLabel: 'Cliente recorrente desde 2024',
  },
  {
    id: 'test-2',
    clientName: 'Eng. Fernanda Oliveira',
    role: 'Engenheira Civil Residente',
    company: 'Construtora Litoral Norte Obras',
    city: 'Alagoinhas / Catu, BA',
    sector: 'Construção Civil',
    projectDelivered: 'Perfis U enrijecidos e Telhas Galvalume TP40 para galpão de 680 m²',
    quote:
      'Precisávamos fechar a cobertura de um centro de distribuição com cronograma apertado. A Guerreiro entregou todas as vigas U enrijecidas e as telhas Galvalume cortadas com 6 metros exatos, sem atraso e com parede rigorosamente dentro da norma.',
    metricOutcome: '680 m² de estrutura metálica entregues 4 dias antes do prazo',
    dateLabel: 'Obra concluída em Agosto 2026',
  },
  {
    id: 'test-3',
    clientName: 'Roberto Magalhães',
    role: 'Coordenador de Manutenção Industrial',
    company: 'Agroindústria Vale do Sauípe',
    city: 'Entre Rios / Alagoinhas, BA',
    sector: 'Indústria & Agro',
    projectDelivered: 'Chapas Xadrez 3/16" e cantoneiras laminadas para plataformas de carga',
    quote:
      'Na manutenção de safra não podemos esperar material vir de Salvador. Encontrar chapa xadrez grossa, perfil estrutural e consumíveis de solda a pronta entrega ali na Rua da Leste no Centro de Alagoinhas salvou nossa parada programada.',
    metricOutcome: '1,8 tonelada de aço estrutural faturada e entregue em 24 horas',
    dateLabel: 'Fornecimento Industrial · Setembro 2026',
  },
];

export const REGIONAL_DELIVERY_ROUTES = [
  {
    city: 'Alagoinhas (Centro e Bairros)',
    distanceKm: 3.5,
    estimatedDelivery: 'Entrega no mesmo dia (2h a 4h)',
    freightPolicy: 'Frete grátis acima de R$ 1.200,00',
  },
  {
    city: 'Aramari — BA',
    distanceKm: 18,
    estimatedDelivery: 'Saídas diárias (Manhã e Tarde)',
    freightPolicy: 'Taxa reduzida / Grátis para cargas fechadas',
  },
  {
    city: 'Catu — BA',
    distanceKm: 24,
    estimatedDelivery: 'Rota diária pela BR-101 / BA-093',
    freightPolicy: 'Sob consulta conforme peso (kg)',
  },
  {
    city: 'Pojuca — BA',
    distanceKm: 39,
    estimatedDelivery: 'Entregas Terça, Quinta e Sexta',
    freightPolicy: 'Sob consulta conforme peso (kg)',
  },
  {
    city: 'Inhambupe — BA',
    distanceKm: 44,
    estimatedDelivery: 'Rota BR-110 programada 3x na semana',
    freightPolicy: 'Sob consulta conforme peso (kg)',
  },
  {
    city: 'Entre Rios — BA',
    distanceKm: 51,
    estimatedDelivery: 'Rota BR-101 Norte programada',
    freightPolicy: 'Sob consulta conforme peso (kg)',
  },
];
