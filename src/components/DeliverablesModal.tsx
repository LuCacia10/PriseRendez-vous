import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  Code2,
  Database,
  Smartphone,
  Copy,
  Check,
  Download,
  BookOpen,
  X,
  Server,
  GitBranch,
  FolderTree,
  FileCode,
  Layers,
  Users,
  Shield,
  Workflow,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { mysqlSchema, sqliteSchema } from '../lib/sqlData';
import { flutterCodebase } from '../lib/flutterData';
import { gitCommits, gitReadme } from '../lib/gitData';
import { umlActors, umlUseCases, umlClasses } from '../lib/umlData';

interface DeliverablesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliverablesModal: React.FC<DeliverablesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    'sql' | 'flutter' | 'uml' | 'git' | 'api' | 'setup'
  >('sql');
  const [selectedSqlEngine, setSelectedSqlEngine] = useState<'mysql' | 'sqlite'>('mysql');
  const [activeFlutterFile, setActiveFlutterFile] = useState<string>('lib/main.dart');
  const [selectedUmlView, setSelectedUmlView] = useState<'usecase' | 'class'>('usecase');
  const [selectedActorFilter, setSelectedActorFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentSql =
    selectedSqlEngine === 'mysql'
      ? mysqlSchema
      : sqliteSchema;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const flutterFileKeys = Object.keys(flutterCodebase);

  const filteredUseCases =
    selectedActorFilter === 'all'
      ? umlUseCases
      : umlUseCases.filter((uc) => uc.actors.includes(selectedActorFilter));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-6xl w-full h-[94vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold shadow-inner">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  Livrables & Architecture du Projet
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Frontend: Flutter • Backend: Node.js • Base: MySQL 8.0+
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Spécifications complètes : Flutter Clean Architecture, API Node.js/Express, Base MySQL relationnelle et diagrammes UML.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-blue-500 text-blue-400 bg-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>1. Schéma Base de Données (MySQL 8.0+ / SQLite)</span>
          </button>

          <button
            onClick={() => setActiveTab('flutter')}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'flutter'
                ? 'border-blue-500 text-blue-400 bg-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>2. Code Flutter (Clean Architecture)</span>
          </button>

          <button
            onClick={() => setActiveTab('uml')}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'uml'
                ? 'border-blue-500 text-blue-400 bg-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Diagrammes UML (Cas d'usage & Classes)</span>
          </button>

          <button
            onClick={() => setActiveTab('git')}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'git'
                ? 'border-blue-500 text-blue-400 bg-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>4. Git & Commits Historique</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'api'
                ? 'border-blue-500 text-blue-400 bg-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>5. API RESTful Endpoints (Node.js)</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'setup'
                ? 'border-blue-500 text-blue-400 bg-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>6. Guide d'Installation</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/90 font-sans text-xs text-slate-300">
          {/* TAB 1: SQL SCHEMAS */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-200 text-sm">Schéma SQL :</span>
                    <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-700">
                      <button
                        onClick={() => setSelectedSqlEngine('mysql')}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                          selectedSqlEngine === 'mysql'
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        MySQL 8.0+ (Base Serveur Principale)
                      </button>
                      <button
                        onClick={() => setSelectedSqlEngine('sqlite')}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                          selectedSqlEngine === 'sqlite'
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        SQLite (Cache Local Flutter sqflite)
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Schéma MySQL InnoDB complet : tables relationnelles, clés étrangères ON DELETE CASCADE, indexations B-tree, contraintes uniques et jeux d'essai.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(currentSql)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copié !' : 'Copier SQL'}</span>
                  </button>

                  <button
                    onClick={() =>
                      downloadFile(`schema.${selectedSqlEngine}.sql`, currentSql)
                    }
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger ({selectedSqlEngine}.sql)</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] leading-relaxed overflow-x-auto font-mono text-emerald-400 selection:bg-blue-900 shadow-inner max-h-[58vh]">
                {currentSql}
              </pre>
            </div>
          )}

          {/* TAB 2: FLUTTER CODEBASE */}
          {activeTab === 'flutter' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[68vh]">
              {/* File Explorer Tree */}
              <div className="md:col-span-1 bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
                <div className="flex items-center space-x-2 pb-2 mb-2 border-b border-slate-800">
                  <FolderTree className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white text-xs">Arborescence Flutter</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px]">
                  {flutterFileKeys.map((filePath) => {
                    const isSelected = activeFlutterFile === filePath;
                    return (
                      <button
                        key={filePath}
                        onClick={() => setActiveFlutterFile(filePath)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center space-x-2 transition truncate ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                        <span className="truncate">{filePath}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code Viewer */}
              <div className="md:col-span-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                      Dart
                    </span>
                    <span className="font-mono text-slate-200 text-xs font-bold">
                      {activeFlutterFile}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(flutterCodebase[activeFlutterFile] || '')}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copié' : 'Copier'}</span>
                    </button>

                    <button
                      onClick={() =>
                        downloadFile(
                          activeFlutterFile.split('/').pop() || 'file.dart',
                          flutterCodebase[activeFlutterFile] || ''
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center space-x-1 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger</span>
                    </button>
                  </div>
                </div>

                <pre className="flex-1 p-3 bg-slate-950 text-blue-300 font-mono text-[11px] leading-relaxed overflow-x-auto overflow-y-auto">
                  {flutterCodebase[activeFlutterFile] || '// Aucun fichier sélectionné'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: UML DIAGRAMS */}
          {activeTab === 'uml' && (
            <div className="space-y-4">
              {/* UML Sub-Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-300 font-bold">Vue Diagramme :</span>
                  <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-700">
                    <button
                      onClick={() => setSelectedUmlView('usecase')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                        selectedUmlView === 'usecase'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Diagramme de Cas d'Utilisation (Use Case)
                    </button>
                    <button
                      onClick={() => setSelectedUmlView('class')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                        selectedUmlView === 'class'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Diagramme de Classes (Class Diagram)
                    </button>
                  </div>
                </div>

                {selectedUmlView === 'usecase' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-xs">Filtrer par acteur :</span>
                    <select
                      value={selectedActorFilter}
                      onChange={(e) => setSelectedActorFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1 text-xs outline-none"
                    >
                      <option value="all">Tous les acteurs</option>
                      {umlActors.map((actor) => (
                        <option key={actor.id} value={actor.id}>
                          {actor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* USE CASE DIAGRAM RENDERER */}
              {selectedUmlView === 'usecase' && (
                <div className="space-y-6">
                  {/* Acteurs */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>Acteurs du Système UML 2.5</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {umlActors.map((actor) => (
                        <div
                          key={actor.id}
                          className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: actor.color }}
                            />
                            <h4 className="font-bold text-white text-sm">{actor.name}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block mb-2">
                            {actor.role}
                          </span>
                          <p className="text-xs text-slate-400 leading-snug">
                            {actor.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cas d'usage */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
                      <Workflow className="w-4 h-4 text-emerald-400" />
                      <span>Cas d'Utilisation & Relations (Include / Extend)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredUseCases.map((uc) => (
                        <div
                          key={uc.id}
                          className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                                {uc.category}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 font-bold">
                                {uc.id}
                              </span>
                            </div>
                            <h4 className="font-bold text-white text-sm mb-1.5">
                              {uc.name}
                            </h4>
                            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                              {uc.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                            <div className="flex items-center flex-wrap gap-1">
                              <span className="text-slate-500">Acteurs :</span>
                              {uc.actors.map((actId) => {
                                const act = umlActors.find((a) => a.id === actId);
                                return (
                                  <span
                                    key={actId}
                                    className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold text-[10px]"
                                  >
                                    {act?.name || actId}
                                  </span>
                                );
                              })}
                            </div>

                            {uc.includes && uc.includes.length > 0 && (
                              <div className="text-emerald-400 font-mono text-[10px]">
                                «include» : {uc.includes.join(', ')}
                              </div>
                            )}

                            {uc.extends && uc.extends.length > 0 && (
                              <div className="text-amber-400 font-mono text-[10px]">
                                «extend» : {uc.extends.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CLASS DIAGRAM RENDERER */}
              {selectedUmlView === 'class' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {umlClasses.map((cls) => (
                    <div
                      key={cls.name}
                      className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col"
                    >
                      {/* Class Header */}
                      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 text-center">
                        {cls.stereotype && (
                          <span className="text-[10px] font-mono text-purple-400 block mb-0.5">
                            «{cls.stereotype}»
                          </span>
                        )}
                        <h4 className="font-bold text-white text-base font-mono">
                          {cls.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {cls.description}
                        </p>
                      </div>

                      {/* Attributes Section */}
                      <div className="p-3 border-b border-slate-800/80 bg-slate-950 font-mono text-[11px] space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Attributs
                        </span>
                        {cls.attributes.map((attr, idx) => (
                          <div key={idx} className="flex items-center text-slate-300">
                            <span
                              className={`w-3.5 font-bold ${
                                attr.visibility === '+'
                                  ? 'text-emerald-400'
                                  : attr.visibility === '-'
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {attr.visibility}
                            </span>
                            <span className="text-blue-300">{attr.name}</span>
                            <span className="text-slate-500 mx-1">:</span>
                            <span className="text-slate-400">{attr.type}</span>
                          </div>
                        ))}
                      </div>

                      {/* Methods Section */}
                      <div className="p-3 border-b border-slate-800/80 bg-slate-950 font-mono text-[11px] space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Méthodes & Opérations
                        </span>
                        {cls.methods.map((method, idx) => (
                          <div key={idx} className="text-slate-300">
                            <span
                              className={`font-bold mr-1 ${
                                method.visibility === '+'
                                  ? 'text-emerald-400'
                                  : method.visibility === '-'
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {method.visibility}
                            </span>
                            <span className="text-amber-300">{method.name}</span>
                            <span className="text-slate-400">
                              ({method.params || ''})
                            </span>
                            <span className="text-slate-500 mx-1">→</span>
                            <span className="text-purple-400">
                              {method.returnType}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Relations Section */}
                      {cls.relations && cls.relations.length > 0 && (
                        <div className="p-3 bg-slate-900/40 text-[10px] space-y-1">
                          <span className="font-bold text-slate-500 block uppercase">
                            Relations UML
                          </span>
                          {cls.relations.map((rel, idx) => (
                            <div key={idx} className="text-slate-400 flex items-center justify-between">
                              <span>
                                ↳ <strong className="text-slate-200">{rel.type}</strong> ({rel.label}) → <span className="text-blue-400">{rel.target}</span>
                              </span>
                              <span className="font-mono text-slate-500 font-bold">
                                [{rel.multiplicity}]
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GIT COMMITS & REPO */}
          {activeTab === 'git' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span>Historique Git & Conventional Commits</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Suivi chronologique des versions et livrables selon la norme standardisée.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-xs">
                  branch: main (clean)
                </span>
              </div>

              <div className="space-y-2.5">
                {gitCommits.map((commit) => (
                  <div
                    key={commit.hash}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-start sm:items-center space-x-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-blue-400 border border-slate-700">
                        {commit.hash}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          commit.type === 'feat'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : commit.type === 'refactor'
                            ? 'bg-purple-500/20 text-purple-300'
                            : commit.type === 'docs'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {commit.type}
                      </span>
                      <span className="font-medium text-slate-200 text-xs">
                        {commit.message}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 shrink-0">
                      <span>{commit.author}</span>
                      <span>•</span>
                      <span>{commit.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REST API ENDPOINTS */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-1">
                  Catalogue des Endpoints API RESTful (Node.js & Express)
                </h3>
                <p className="text-xs text-slate-400">
                  Documentation interactive des routes serveur authentifiées avec JWT Bearer Token.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { method: 'POST', path: '/api/auth/register', desc: 'Inscription usager citoyen (email, nom, tél, pièce identité)', role: 'Public' },
                  { method: 'POST', path: '/api/auth/login', desc: 'Connexion JWT pour usagers, agents et administrateurs', role: 'Public' },
                  { method: 'GET', path: '/api/services', desc: 'Catalogue des démarches administratives et justificatifs', role: 'Public' },
                  { method: 'POST', path: '/api/services', desc: 'Création d\'un nouveau service administratif (CRUD)', role: 'Admin' },
                  { method: 'PUT', path: '/api/services/:id', desc: 'Modification d\'un service et quotas (CRUD)', role: 'Admin' },
                  { method: 'DELETE', path: '/api/services/:id', desc: 'Suppression d\'un service (CRUD)', role: 'Admin' },
                  { method: 'GET', path: '/api/services/:id/slots?date=YYYY-MM-DD', desc: 'Disponibilité en temps réel des créneaux par heure et capacité', role: 'Citoyen' },
                  { method: 'POST', path: '/api/appointments', desc: 'Réservation avec verrouillage atomique et génération de Pass QR', role: 'Citoyen' },
                  { method: 'GET', path: '/api/appointments/me', desc: 'Historique des rendez-vous de l\'usager connecté', role: 'Citoyen' },
                  { method: 'PATCH', path: '/api/appointments/:id/cancel', desc: 'Annulation d\'un rendez-vous avec libération de créneau', role: 'Citoyen/Admin' },
                  { method: 'GET', path: '/api/appointments/:id/qrcode', desc: 'Rendu haute résolution du QR Code scannable', role: 'Citoyen' },
                  { method: 'GET', path: '/api/admin/appointments', desc: 'Recherche et filtrage de tous les RDV administratifs', role: 'Agent/Admin' },
                  { method: 'POST', path: '/api/admin/scan-qr', desc: 'Décodage et vérification directe du payload QR code guichet', role: 'Agent/Admin' },
                  { method: 'POST', path: '/api/appointments/:id/validate', desc: 'Validation de présence par l\'agent guichet au moment du scan', role: 'Agent/Admin' },
                  { method: 'GET', path: '/api/admin/stats', desc: 'KPIs et statistiques globales de fréquentation', role: 'Admin' },
                  { method: 'GET', path: '/api/notifications/me', desc: 'Historique des notifications push FCM pour l\'usager', role: 'Citoyen' },
                ].map((ep, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] w-16 text-center ${
                          ep.method === 'POST'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : ep.method === 'PATCH' || ep.method === 'PUT'
                            ? 'bg-amber-500/20 text-amber-400'
                            : ep.method === 'DELETE'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono font-bold text-slate-200 text-xs">
                        {ep.path}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-slate-400">{ep.desc}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] border border-slate-700">
                        {ep.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETUP & INSTALLATION GUIDE */}
          {activeTab === 'setup' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span>Guide d'Installation et de Déploiement Complet</span>
                </h3>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-200 text-xs flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono text-[10px]">
                        1
                      </span>
                      <span>Prérequis Système</span>
                    </h4>
                    <ul className="list-disc list-inside text-slate-400 text-xs pl-6 space-y-1">
                      <li>Flutter SDK 3.x+ et Dart 3.x</li>
                      <li>Node.js v18+ et npm ou yarn</li>
                      <li>MySQL Server 8.0+ (InnoDB)</li>
                      <li>Android Studio / Xcode pour le simulateur mobile</li>
                    </ul>
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-200 text-xs flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono text-[10px]">
                        2
                      </span>
                      <span>Initialisation de la Base de Données MySQL</span>
                    </h4>
                    <pre className="p-3 bg-slate-900 rounded-xl text-emerald-400 font-mono text-[11px]">
{`# Connexion au serveur MySQL
mysql -u root -p

# Importation du schéma et des données initiales
SOURCE schema.mysql.sql;

# Vérification des tables créées
USE rendezvous_admin_db;
SHOW TABLES;`}
                    </pre>
                  </div>

                  {/* Step 3 */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-200 text-xs flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono text-[10px]">
                        3
                      </span>
                      <span>Lancement du Backend Node.js</span>
                    </h4>
                    <pre className="p-3 bg-slate-900 rounded-xl text-emerald-400 font-mono text-[11px]">
{`cd server
npm install
npm run build
npm start
# Le serveur écoute sur http://localhost:3000`}
                    </pre>
                  </div>

                  {/* Step 4 */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-200 text-xs flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono text-[10px]">
                        4
                      </span>
                      <span>Lancement de l'Application Mobile Flutter</span>
                    </h4>
                    <pre className="p-3 bg-slate-900 rounded-xl text-emerald-400 font-mono text-[11px]">
{`cd app
flutter pub get
flutter run
# Ou build release APK : flutter build apk --release`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
