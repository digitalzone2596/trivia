import React, { useState } from 'react';
import { HelpCircle, X, Plus, Trash2, RotateCcw, Check, Sparkles } from 'lucide-react';
import { TriviaQuestion } from '../types/trivia';

interface QuestionsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: TriviaQuestion[];
  onAddQuestion: (q: TriviaQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onResetQuestions: () => void;
}

export const QuestionsManagerModal: React.FC<QuestionsManagerModalProps> = ({
  isOpen,
  onClose,
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onResetQuestions,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState('Videojuegos 🎮');
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState('500');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optA || !optB || !optC || !optD) return;

    const newQ: TriviaQuestion = {
      id: 'q_' + Date.now(),
      category: category.trim() || 'General 🧠',
      question: questionText.trim(),
      options: [
        { id: 'A', text: optA.trim(), votes: Math.floor(Math.random() * 40) + 10 },
        { id: 'B', text: optB.trim(), votes: Math.floor(Math.random() * 40) + 10 },
        { id: 'C', text: optC.trim(), votes: Math.floor(Math.random() * 40) + 10 },
        { id: 'D', text: optD.trim(), votes: Math.floor(Math.random() * 40) + 10 },
      ],
      correctAnswer,
      explanation: explanation.trim() || undefined,
      points: parseInt(points, 10) || 500,
    };

    onAddQuestion(newQ);
    // Reset form
    setQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setExplanation('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Banco de Preguntas Modular</h2>
              <p className="text-xs text-slate-400">
                Personaliza o agrega preguntas para tus transmisiones en vivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="text-xs text-slate-300">
            Total preguntas activas: <strong className="text-cyan-400 font-mono">{questions.length}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onResetQuestions}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-cyan-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Pregunta</span>
            </button>
          </div>
        </div>

        {/* Add Form Container */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Categoría</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ej: Cine 🍿 o Anime ⚡"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Puntos</label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="500"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Pregunta</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={2}
                placeholder="Escribe aquí la pregunta de la trivia..."
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] font-semibold text-cyan-400 block mb-1">Opción A</span>
                <input
                  type="text"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  placeholder="Respuesta A"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-cyan-400 block mb-1">Opción B</span>
                <input
                  type="text"
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  placeholder="Respuesta B"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-cyan-400 block mb-1">Opción C</span>
                <input
                  type="text"
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  placeholder="Respuesta C"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-cyan-400 block mb-1">Opción D</span>
                <input
                  type="text"
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  placeholder="Respuesta D"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-emerald-400 block mb-1">Respuesta Correcta</label>
                <div className="flex gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCorrectAnswer(id)}
                      className={`flex-1 py-1 rounded text-xs font-bold border transition-colors ${
                        correctAnswer === id
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Explicación o Dato Curioso</label>
                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Ej: Según los récords Guinness..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                Guardar Pregunta
              </button>
            </div>
          </form>
        )}

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                  <span className="text-[10px] bg-cyan-950/60 text-cyan-300 px-2 py-0.2 rounded border border-cyan-800/40 font-semibold">
                    {q.category}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold font-mono">
                    +{q.points} PTS
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 mb-1.5 leading-snug">
                  {q.question}
                </h4>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-1.5 ${
                        opt.id === q.correctAnswer
                          ? 'text-emerald-400 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="w-4 text-center font-mono font-bold">
                        {opt.id}:
                      </span>
                      <span className="truncate">{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onDeleteQuestion(q.id)}
                disabled={questions.length <= 1}
                title={questions.length <= 1 ? 'Se requiere al menos 1 pregunta' : 'Eliminar pregunta'}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Cambios guardados localmente</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
