import React from 'react';
import { X, Trash2, Plus, Minus, MessageSquare, ArrowRight } from 'lucide-react';
import {
  QuoteCartItem,
  calculateCartTotals,
  buildWhatsAppQuoteUrl,
} from '../utils/metallurgyLogic';
import { BUSINESS_INFO } from '../data/catalogData';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: QuoteCartItem[];
  onUpdateQuantity: (productId: string, variantId: string, newQty: number) => void;
  onClearCart: () => void;
  onProceedToForm: () => void;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  onProceedToForm,
}) => {
  if (!isOpen) return null;

  const totals = calculateCartTotals(cart);
  const whatsappUrl = buildWhatsAppQuoteUrl({
    whatsappNumber: BUSINESS_INFO.whatsappNumber,
    cart,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-quote-title"
    >
      <div className="w-full max-w-lg bg-white h-full flex flex-col justify-between shadow-2xl border-l border-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 id="drawer-quote-title" className="text-lg font-bold text-slate-900">
              Lista de Cotação Técnica
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {totals.totalDistinctItems} {totals.totalDistinctItems === 1 ? 'material selecionado' : 'materiais selecionados'} · Peso total: {totals.totalWeightKg.toFixed(2).replace('.', ',')} kg
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar Lista de Cotação"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-14 px-4 border border-dashed border-slate-200 rounded-xl">
              <p className="text-base font-semibold text-slate-800">
                Sua lista de orçamento está vazia
              </p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                Adicione tubos Metalon, chapas de aço, perfis U ou telhas Galvalume do catálogo para calcular o peso e enviar pelo WhatsApp.
              </p>
            </div>
          ) : (
            <>
              {/* Free local freight indicator */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                {totals.qualifiesFreeLocalFreight ? (
                  <p className="font-semibold text-emerald-800">
                    Frete Urbano Grátis liberado para Alagoinhas (Pedido acima de R$ 1.200,00).
                  </p>
                ) : (
                  <p>
                    Faltam{' '}
                    <span className="font-mono font-semibold text-slate-900">
                      R$ {(1200 - totals.estimatedTotalBrl).toFixed(2).replace('.', ',')}
                    </span>{' '}
                    para Frete Grátis no perímetro urbano de Alagoinhas.
                  </p>
                )}
              </div>

              <ul className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {cart.map((item) => {
                  const lineTotal = item.unitPriceBrl * item.quantity;
                  const lineWeight = item.weightKgPerUnit * item.quantity;
                  return (
                    <li
                      key={`${item.productId}-${item.variantId}`}
                      className="p-4 bg-white flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-mono text-slate-500">{item.sku}</p>
                          <h3 className="text-sm font-bold text-slate-900">
                            {item.productName}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Bitola: {item.variantLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.productId, item.variantId, 0)}
                          aria-label={`Remover ${item.productName} ${item.variantLabel}`}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                            aria-label={`Diminuir quantidade de ${item.productName}`}
                            className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-mono text-sm font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                            aria-label={`Aumentar quantidade de ${item.productName}`}
                            className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs text-slate-500 ml-1">
                            ({item.unitLabel})
                          </span>
                        </div>

                        <div className="text-right font-mono tabular-nums">
                          <p className="text-sm font-semibold text-slate-900">
                            R$ {lineTotal.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {lineWeight.toFixed(1).replace('.', ',')} kg
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-slate-200 bg-[#F8FAFC] space-y-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Peso Bruto Estimado:</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {totals.totalWeightKg.toFixed(2).replace('.', ',')} kg
              </span>
            </div>
            <div className="flex items-center justify-between text-base font-bold text-slate-900">
              <span>Subtotal de Referência:</span>
              <span className="font-mono text-amber-700 tabular-nums">
                R$ {totals.estimatedTotalBrl.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              Enviar Lista no WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToForm();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Formalizar no Formulário
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 underline pt-1"
            >
              Limpar todos os itens da cotação
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
