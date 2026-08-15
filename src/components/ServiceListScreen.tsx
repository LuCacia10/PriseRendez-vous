import React, { useState } from 'react';
import { Service } from '../types';
import {
  Search,
  CreditCard,
  BookOpen,
  FileText,
  Car,
  Globe,
  Home as HomeIcon,
  Clock,
  CheckCircle2,
  ChevronRight,
  Info,
  CalendarCheck,
  ShieldAlert,
} from 'lucide-react';

interface ServiceListScreenProps {
  services: Service[];
  onSelectServiceToBook: (service: Service) => void;
}

const CATEGORIES = [
  'Tous les services',
  'Identité & Passeport',
  'État Civil & Famille',
  'Transports & Titres',
  'Étrangers & Titres',
  'Citoyenneté & Accueil',
];

export const ServiceListScreen: React.FC<ServiceListScreenProps> = ({
  services,
  onSelectServiceToBook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous les services');
  const [activeServiceDetail, setActiveServiceDetail] = useState<Service | null>(null);

  const getServiceIcon = (name: string, category: string) => {
    if (name.includes('Identité') || name.includes('CNI')) return <CreditCard className="w-5 h-5" />;
    if (name.includes('Passeport')) return <BookOpen className="w-5 h-5" />;
    if (category.includes('État Civil')) return <FileText className="w-5 h-5" />;
    if (category.includes('Transports')) return <Car className="w-5 h-5" />;
    if (category.includes('Étrangers')) return <Globe className="w-5 h-5" />;
    return <HomeIcon className="w-5 h-5" />;
  };

  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'Tous les services' || srv.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-4 space-y-4">
      {/* Banner Public Service Info */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold mb-2 backdrop-blur-sm">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Guichet Numérique Ouvert 24h/7</span>
          </div>
          <h2 className="text-lg font-extrabold leading-snug">
            Guichet des démarches administratives
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-sm">
            Réservez un créneau en quelques clics, obtenez votre ticket avec QR Code et gagnez du temps à l'accueil.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une démarche (ex. passeport, CNI, permis...)"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
        />
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>{filteredServices.length} démarche(s) disponible(s)</span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Aucun service trouvé</p>
            <p className="text-xs text-slate-400 mt-1">
              Essayez de modifier votre mot-clé de recherche ou filtre.
            </p>
          </div>
        ) : (
          filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
              onClick={() => setActiveServiceDetail(srv)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                  {getServiceIcon(srv.name, srv.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {srv.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{srv.durationMinutes} min</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition truncate">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    {srv.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {srv.requiredDocuments.length} document(s) requis
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectServiceToBook(srv);
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <span>Réserver</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Service Detail Modal */}
      {activeServiceDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveServiceDetail(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {getServiceIcon(activeServiceDetail.name, activeServiceDetail.category)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                  {activeServiceDetail.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeServiceDetail.name}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              {activeServiceDetail.description}
            </p>

            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Pièces à fournir impérativement :</span>
              </h4>

              <div className="space-y-2">
                {activeServiceDetail.requiredDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                <p>Durée moyenne: <strong className="text-slate-800">{activeServiceDetail.durationMinutes} minutes</strong></p>
                <p>Capacité max par créneau: <strong className="text-slate-800">{activeServiceDetail.maxSlotsPerTime} usagers</strong></p>
              </div>

              <button
                onClick={() => {
                  const srv = activeServiceDetail;
                  setActiveServiceDetail(null);
                  onSelectServiceToBook(srv);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1.5"
              >
                <span>Choisir ce créneau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
