import { PAQUETES } from "@/lib/empresas-content";

interface PaquetesEmpresasProps {
  id?: string;
  /** En /empresas se oculta el link "Conocé más". */
  enLanding?: boolean;
}

export function PaquetesEmpresas({ id = "empresas", enLanding = false }: PaquetesEmpresasProps) {
  return (
    <section id={id} className="bg-brand-light py-16 md:py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">
            Convenios para empresas
          </p>
          <h2 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight mb-4">
            Vouchers para tu equipo
          </h2>
          <p className="font-body text-base md:text-lg text-brand-muted">
            Elegís un paquete mensual, te damos un código por vianda y cada persona lo canjea cuando
            quiere. <strong className="text-brand-dark">Cuanto más grande el paquete, menor el precio por vianda.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PAQUETES.map((p) => (
            <div
              key={p.id}
              className={`relative bg-white rounded-card p-6 flex flex-col shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 ${
                p.destacado ? "ring-2 ring-brand-primary" : ""
              }`}
            >
              {p.destacado && (
                <span className="absolute -top-3 left-6 bg-brand-primary text-white font-body text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-btn">
                  Más elegido
                </span>
              )}
              <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-muted mb-2">
                {p.nombre}
              </p>
              <p className="font-display font-bold text-brand-dark text-5xl leading-none">
                {p.vouchers}
              </p>
              <p className="font-body text-sm text-brand-muted mt-1 mb-4">viandas por mes</p>
              <p className="font-body text-[15px] text-brand-dark mb-5">{p.bajada}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {p.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 font-body text-sm text-brand-muted">
                    <CheckIcon />
                    {it}
                  </li>
                ))}
              </ul>

              <p className="font-body text-sm font-semibold text-brand-dark mb-3">Consultá precio</p>
              <a
                href={`/empresas?paquete=${p.id}#cotizar`}
                className={`inline-flex items-center justify-center font-medium rounded-btn px-5 py-2.5 text-sm transition-all duration-200 active:scale-[0.98] ${
                  p.destacado
                    ? "bg-brand-primary text-white hover:bg-brand-primary-hover"
                    : "border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                }`}
              >
                Cotizá este paquete
              </a>
            </div>
          ))}
        </div>

        {!enLanding && (
          <div className="text-center mt-10">
            <a
              href="/empresas"
              className="font-body text-[15px] font-semibold text-brand-primary hover:text-brand-primary-hover"
            >
              Conocé cómo funcionan los convenios →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
