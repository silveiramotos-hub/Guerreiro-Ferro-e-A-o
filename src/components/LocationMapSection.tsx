import React, { useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Phone, Clock, Truck } from 'lucide-react';
import { BUSINESS_INFO, REGIONAL_DELIVERY_ROUTES } from '../data/catalogData';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

class MapRenderBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const StorefrontMarkerWithInfoWindow: React.FC = () => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  const handleToggle = useCallback(() => {
    setInfoOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setInfoOpen(false);
  }, []);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={BUSINESS_INFO.coordinates}
        onClick={handleToggle}
        title="Guerreiro Ferro e Aço — Rua da Leste, 01 - Centro, Alagoinhas - BA"
      >
        <Pin
          background="#D97706"
          borderColor="#78350F"
          glyphColor="#FFFFFF"
          scale={1.25}
        />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow anchor={marker} onCloseClick={handleClose} maxWidth={280}>
          <div className="p-1 text-slate-900">
            <p className="font-bold text-sm tracking-tight">
              {BUSINESS_INFO.name}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {BUSINESS_INFO.addressStreet} · {BUSINESS_INFO.addressDistrict}
            </p>
            <p className="text-xs font-mono text-slate-700 mt-1">
              CEP: {BUSINESS_INFO.postalCode} · Tel: {BUSINESS_INFO.phoneDisplay}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
              <a
                href={BUSINESS_INFO.googleMapsPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline"
              >
                Abrir rota no Google Maps ↗
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const LocationMapSection: React.FC = () => {
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);
  const selectedRoute = REGIONAL_DELIVERY_ROUTES[selectedCityIndex];

  return (
    <section
      id="localizacao"
      aria-labelledby="heading-localizacao"
      className="py-20 bg-white border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-wider text-amber-700">
            Logística e Retirada Imediata · Centro de Alagoinhas
          </p>
          <h2
            id="heading-localizacao"
            className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
            style={{ textWrap: 'balance' }}
          >
            Localização Estratégica e Frota Própria para Entregas na Região
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Nosso galpão fica na Rua da Leste, nº 01, no coração de Alagoinhas — com pátio amplo para carregamento rápido de caminhonetes, caminhões e retirada imediata de barras de 6 metros.
          </p>
        </div>

        {/* 2-Column Map + Regional Logistics Split */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Interactive Google Map Column */}
          <div className="lg:col-span-7 flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-100 min-h-[420px]">
            <div className="w-full h-[420px] lg:h-full min-h-[420px] relative" data-testid="google-map-container">
              {GOOGLE_MAPS_API_KEY ? (
                <MapRenderBoundary
                  fallback={
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white">
                      <MapPin className="w-10 h-10 text-amber-400 mb-3" />
                      <p className="text-lg font-semibold">{BUSINESS_INFO.name}</p>
                      <p className="text-sm text-slate-300 mt-1">{BUSINESS_INFO.fullAddress}</p>
                      <p className="text-xs font-mono text-slate-400 mt-2">
                        Coordenadas: {BUSINESS_INFO.coordinates.lat}, {BUSINESS_INFO.coordinates.lng}
                      </p>
                    </div>
                  }
                >
                  <APIProvider
                    apiKey={GOOGLE_MAPS_API_KEY}
                    language="pt-BR"
                    region="BR"
                  >
                    <Map
                      style={{ width: '100%', height: '100%' }}
                      defaultCenter={BUSINESS_INFO.coordinates}
                      defaultZoom={16}
                      mapId="DEMO_MAP_ID"
                      gestureHandling="cooperative"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    >
                      <StorefrontMarkerWithInfoWindow />
                    </Map>
                  </APIProvider>
                </MapRenderBoundary>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white">
                  <MapPin className="w-10 h-10 text-amber-400 mb-3" />
                  <p className="text-lg font-semibold">{BUSINESS_INFO.name}</p>
                  <p className="text-sm text-slate-300 mt-1">{BUSINESS_INFO.fullAddress}</p>
                  <p className="text-xs font-mono text-slate-400 mt-2">
                    Coordenadas: {BUSINESS_INFO.coordinates.lat}, {BUSINESS_INFO.coordinates.lng}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom bar under map with direct navigation action */}
            <div className="bg-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs sm:text-sm">
                <span className="font-semibold text-amber-400">Endereço Oficial:</span>{' '}
                <span>{BUSINESS_INFO.fullAddress}</span>
              </div>
              <a
                href={BUSINESS_INFO.googleMapsPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                Traçar Rota no Google Maps
              </a>
            </div>
          </div>

          {/* Address Details & Regional Freight Estimator */}
          <div className="lg:col-span-5 flex flex-col justify-between border border-slate-200 rounded-xl p-6 sm:p-8 bg-[#F8FAFC]">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Dados da Unidade Alagoinhas
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Atendimento presencial no balcão técnico ou despacho expresso para obras.
              </p>

              <dl className="mt-6 space-y-4 text-sm border-t border-b border-slate-200 py-5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                  <div>
                    <dt className="font-semibold text-slate-900">Galpão Central</dt>
                    <dd className="text-slate-600 mt-0.5">
                      {BUSINESS_INFO.addressStreet} · {BUSINESS_INFO.addressDistrict} · CEP {BUSINESS_INFO.postalCode}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                  <div>
                    <dt className="font-semibold text-slate-900">Horário de Expediente</dt>
                    <dd className="text-slate-600 mt-0.5">{BUSINESS_INFO.openingHours}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                  <div>
                    <dt className="font-semibold text-slate-900">Central de Vendas e WhatsApp</dt>
                    <dd className="text-slate-600 font-mono mt-0.5">{BUSINESS_INFO.phoneDisplay}</dd>
                  </div>
                </div>
              </dl>

              {/* Interactive Regional Delivery Calculator */}
              <div className="mt-6">
                <label
                  htmlFor="select-regional-city"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Consultar Prazo de Entrega na Região
                </label>
                <select
                  id="select-regional-city"
                  value={selectedCityIndex}
                  onChange={(e) => setSelectedCityIndex(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
                >
                  {REGIONAL_DELIVERY_ROUTES.map((route, idx) => (
                    <option key={route.city} value={idx}>
                      {route.city} ({route.distanceKm} km)
                    </option>
                  ))}
                </select>

                <div className="mt-4 rounded-lg bg-white border border-slate-200 p-4 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Distância do Galpão:</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {selectedRoute.distanceKm} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Previsão de Saída:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedRoute.estimatedDelivery}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Condição de Frete:</span>
                    <span className="font-semibold text-amber-700">
                      {selectedRoute.freightPolicy}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Truck className="w-4 h-4 text-slate-700 shrink-0" />
                <span>Suporte para barras inteiras de 6,00 m</span>
              </div>
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                  `Olá! Gostaria de consultar a entrega de materiais para ${selectedRoute.city}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Consultar Frete via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
