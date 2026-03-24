import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AxelLogo from '../assets/Axellogo.png';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TEMPLATES = ['executive', 'sales', 'operations', 'finance'];

function colToIndex(col) {
    let out = 0;
    for (let i = 0; i < col.length; i += 1) out = out * 26 + (col.charCodeAt(i) - 64);
    return out;
}

function parseCellRef(cell) {
    const m = /^([A-Z]+)(\d+)$/.exec(String(cell || '').toUpperCase());
    if (!m) return null;
    return { col: colToIndex(m[1]), row: Number(m[2]) };
}

function indexToCol(index) {
    let n = index;
    let out = '';
    while (n > 0) {
        const rem = (n - 1) % 26;
        out = String.fromCharCode(65 + rem) + out;
        n = Math.floor((n - 1) / 26);
    }
    return out || 'A';
}

function sheetJsonToTable(sheetMap) {
    const entries = Object.entries(sheetMap || {});
    if (!entries.length) return { columns: [], rows: [] };
    let maxRow = 1, maxCol = 1;
    entries.forEach(([cell]) => {
        const parsed = parseCellRef(cell);
        if (!parsed) return;
        maxRow = Math.max(maxRow, parsed.row);
        maxCol = Math.max(maxCol, parsed.col);
    });
    const headers = [];
    for (let c = 1; c <= maxCol; c += 1) {
        const cell = Object.keys(sheetMap).find((k) => {
            const p = parseCellRef(k);
            return p && p.row === 1 && p.col === c;
        });
        headers.push(String(cell ? sheetMap[cell]?.value : '') || `Column ${c}`);
    }
    const rows = [];
    for (let r = 2; r <= maxRow; r += 1) {
        const rowObj = {};
        rowObj.__rowNumber = r;
        let nonEmpty = false;
        for (let c = 1; c <= maxCol; c += 1) {
            const match = Object.keys(sheetMap).find((k) => {
                const p = parseCellRef(k);
                return p && p.row === r && p.col === c;
            });
            const rawValue = match ? sheetMap[match]?.value : '';
            // Safety: never show raw formulas in the UI (must show computed value only).
            const value = (typeof rawValue === 'string' && rawValue.startsWith('=')) ? '' : rawValue;
            rowObj[headers[c - 1]] = value ?? '';
            if (value !== '' && value !== null && value !== undefined) nonEmpty = true;
        }
        if (nonEmpty) rows.push(rowObj);
    }
    return { columns: headers, rows };
}

function formatExplanation(text) {
    if (!text) return text;
    let normalized = text
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/^\* /gm, '- ')
        .replace(/^- \*\*/gm, '- ')
        .replace(/\*\*/g, '')
        .trim();
    const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.some((line) => /^[-•]\s+/.test(line))) {
        return lines.join('\n');
    }
    if (lines.length > 1) {
        return lines.map((line) => `- ${line.replace(/^\d+\.\s*/, '')}`).join('\n');
    }
    const blob = lines[0] || '';
    if (/Business Insight\s*\d+/i.test(blob)) {
        const parts = blob.split(/(?=\s*Business Insight\s*\d+)/i).map((s) => s.trim()).filter(Boolean);
        return parts.map((p) => `- ${p}`).join('\n');
    }
    if (/\d+\.\s/.test(blob)) {
        const parts = blob.split(/\s*(?=\d+\.\s)/g).map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
            return parts.map((p) => `- ${p.replace(/^\d+\.\s*/, '')}`).join('\n');
        }
    }
    if (blob.includes(';') && blob.length > 160) {
        return blob.split(';').map((s) => s.trim()).filter(Boolean).map((s) => `- ${s}`).join('\n');
    }
    if (blob.length > 200) {
        const sentences = blob.split(/(?<=[.!?])\s+(?=[A-Z(0-9"'])/).map((s) => s.trim()).filter(Boolean);
        if (sentences.length >= 3) {
            return sentences.map((s) => `- ${s}`).join('\n');
        }
    }
    return `- ${blob}`;
}

function ExplanationText({ text }) {
    const formatted = formatExplanation(text);
    const lines = formatted.split('\n').map((l) => l.trim()).filter(Boolean);
    const items = lines.map((line) => line.replace(/^[-•*]\s+/, '').trim()).filter(Boolean);
    const compactItems = items.map((item) => {
        const parts = item.split(/(?<=[.!?])\s+/).filter(Boolean);
        return parts.slice(0, 2).join(' ');
    });
    if (compactItems.length >= 1 || (items.length === 1 && lines[0]?.trim().startsWith('-'))) {
        return (
            <ul className="list-none space-y-2 pl-0 my-0">
                {compactItems.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                        <span className="text-teal-500 shrink-0 select-none" aria-hidden>•</span>
                        <span className="flex-1 min-w-0" style={{ color: 'var(--text-primary)' }}>{item}</span>
                    </li>
                ))}
            </ul>
        );
    }
    return <span className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{formatted}</span>;
}

const CHART_ICONS = { bar: 'B', line: 'L', pie: 'P' };


function AnimatedStat({ label, value, icon, delay = 0 }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(t);
    }, [delay]);
    return (
        <div
            className={`rounded-xl px-3 py-2.5 transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
            <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{icon}</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
        </div>
    );
}

function MiniTable({ data, title, maxRows = 10 }) {
    if (!data || !data.columns?.length || !data.rows?.length) return null;
    const visibleRows = data.rows.slice(0, maxRows);
    return (
        <div className="mt-3">
            {title && <p className="text-xs font-semibold text-teal-400 mb-1">{title}</p>}
            <div className="overflow-x-auto rounded-lg max-h-[260px] overflow-y-auto" style={{ border: '1px solid var(--border-color)' }}>
                <table className="min-w-full text-xs">
                    <thead className="sticky top-0 z-10" style={{ background: 'var(--card-bg)' }}>
                        <tr>
                            {data.columns.map((col) => (
                                <th key={col} className="px-2 py-1.5 text-left font-semibold whitespace-nowrap" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleRows.map((row, ri) => (
                            <tr key={ri} className="hover:opacity-80" style={{ background: ri % 2 === 0 ? 'var(--panel-bg)' : 'var(--card-bg)' }}>
                                {data.columns.map((col) => (
                                    <td key={`${ri}-${col}`} className="px-2 py-1 max-w-[180px] truncate whitespace-nowrap" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                        {row[col] === null || row[col] === undefined ? '' : String(row[col])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.rows.length > maxRows && (
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Showing {maxRows} of {data.rows.length} rows</p>
            )}
        </div>
    );
}

function KpiCards({ kpis }) {
    if (!kpis?.length) return null;
    return (
        <div className="mt-3 grid grid-cols-2 gap-2">
            {kpis.map((kpi, i) => (
                <div key={i} className="bg-teal-900/30 border border-teal-700/40 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-teal-400 font-medium uppercase tracking-wide">{kpi.label}</p>
                    <p className="text-sm font-bold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>{kpi.formula || kpi.value || '--'}</p>
                </div>
            ))}
        </div>
    );
}

function ChangeLog() { return null; }

function ChartCards({ charts }) {
    if (!charts?.length) return null;
    return (
        <div className="mt-3">
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Charts Created</p>
            <div className="flex flex-wrap gap-2">
                {charts.map((ch, i) => (
                    <div key={i} className="flex items-center gap-2 bg-teal-900/30 border border-teal-700/40 rounded-lg px-3 py-1.5">
                        <span className="w-6 h-6 flex items-center justify-center rounded bg-teal-800 text-teal-300 text-[10px] font-bold">
                            {CHART_ICONS[ch.type] || 'C'}
                        </span>
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{ch.title}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{ch.type} chart on {ch.sheet}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DashboardBadge({ summary, onSwitch }) {
    if (!summary?.created) return null;
    return (
        <div className="mt-3 flex items-center gap-2 bg-teal-900/30 border border-teal-600/40 rounded-lg px-3 py-2">
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-800 text-teal-300 text-xs font-bold">D</span>
            <div className="flex-1">
                <p className="text-xs font-semibold text-teal-300">Dashboard Created: {summary.sheet}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{summary.elements} element(s)</p>
            </div>
            {onSwitch && (
                <button type="button" onClick={onSwitch} className="text-[10px] bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700">View</button>
            )}
        </div>
    );
}

function RichMessage({ msg, onSwitchSheet }) {
    if (msg.role === 'user') {
        if (msg.imageUrl) {
            return (
                <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl p-3 bg-teal-600 text-white">
                        <p className="text-sm whitespace-pre-wrap mb-2">{msg.text}</p>
                        <img src={msg.imageUrl} alt="Uploaded reference" className="rounded-lg max-h-40 border border-white/20" />
                    </div>
                </div>
            );
        }
        return (
            <div className="flex justify-end">
                <div className="max-w-[85%] rounded-xl p-3 text-sm whitespace-pre-wrap bg-teal-600 text-white">{msg.text}</div>
            </div>
        );
    }

    if (msg.isError) {
        return (
            <div className="flex justify-start">
                <div className="max-w-[95%] rounded-xl p-3 text-sm whitespace-pre-wrap bg-red-900/30 text-red-300 border border-red-700/40">{msg.text}</div>
            </div>
        );
    }

    const hasRichContent = msg.changes?.length || msg.charts?.length || msg.dashboardSummary?.created;
    if (!hasRichContent) {
        return (
            <div className="flex justify-start">
                <div className="max-w-[95%] rounded-xl p-3" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                    <ExplanationText text={msg.text} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start">
            <div className="max-w-[95%] w-full rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="p-3"><ExplanationText text={msg.text} /></div>
                <div className="px-3 pb-3 space-y-1">
                    <KpiCards kpis={msg.dashboardSummary?.kpis} />
                    <ChartCards charts={msg.charts} />
                    <DashboardBadge summary={msg.dashboardSummary} onSwitch={msg.dashboardSummary?.sheet ? () => onSwitchSheet(msg.dashboardSummary.sheet) : null} />
                    <ChangeLog changes={msg.changes} />
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { dark, toggle: toggleTheme } = useTheme();
    const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'User';

    const [file, setFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([{
        role: 'assistant',
        text: 'Hi! I am your Axel AI assistant. Upload an Excel file and I will analyze, transform, and generate structured insights from your data.',
    }]);
    const [statusText, setStatusText] = useState('Ready');

    const [sessionId, setSessionId] = useState(localStorage.getItem('excelSessionId') || '');
    const [filename, setFilename] = useState(localStorage.getItem('filename') || '');
    const [downloadUrl, setDownloadUrl] = useState(localStorage.getItem('downloadUrl') || '');
    const [sheetJson, setSheetJson] = useState({});
    const [sheetNames, setSheetNames] = useState([]);
    const [currentSheet, setCurrentSheet] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('operations');

    const [referenceImage, setReferenceImage] = useState(null);
    const [referenceImagePreview, setReferenceImagePreview] = useState('');
    const imageInputRef = useRef(null);
    const textareaRef = useRef(null);

    const [datasetStats, setDatasetStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [recentChangedCells, setRecentChangedCells] = useState(new Set());

    const [leftPaneWidth, setLeftPaneWidth] = useState(55);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (event) => {
            if (!isResizing || !containerRef.current) return;
            const bounds = containerRef.current.getBoundingClientRect();
            const pct = ((event.clientX - bounds.left) / bounds.width) * 100;
            setLeftPaneWidth(Math.max(25, Math.min(75, pct)));
        };
        const stop = () => setIsResizing(false);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', stop);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stop);
        };
    }, [isResizing]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatLoading]);

    const tableData = useMemo(() => {
        if (!currentSheet || !sheetJson[currentSheet]) return { columns: [], rows: [] };
        return sheetJsonToTable(sheetJson[currentSheet]);
    }, [sheetJson, currentSheet]);

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return tableData.rows;
        const term = searchTerm.toLowerCase();
        return tableData.rows.filter((row) =>
            tableData.columns.some((col) => String(row[col] ?? '').toLowerCase().includes(term))
        );
    }, [tableData, searchTerm]);

    useEffect(() => {
        if (tableData.rows.length > 0) {
            const totalCells = tableData.rows.length * tableData.columns.length;
            let missing = 0, duplicates = 0;
            const rowStrings = new Set();
            tableData.rows.forEach((row) => {
                const str = JSON.stringify(row);
                if (rowStrings.has(str)) duplicates++;
                rowStrings.add(str);
                tableData.columns.forEach((col) => {
                    if (row[col] === '' || row[col] === null || row[col] === undefined) missing++;
                });
            });
            setDatasetStats({
                rows: tableData.rows.length,
                columns: tableData.columns.length,
                cells: totalCells,
                missing,
                duplicates,
                completeness: totalCells > 0 ? Math.round(((totalCells - missing) / totalCells) * 100) : 0,
            });
        }
    }, [tableData]);

    const autoResize = (el) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        navigate('/');
    };

    const switchToSheet = (name) => {
        if (name && sheetNames.includes(name)) setCurrentSheet(name);
        else if (name) {
            setSheetNames((prev) => prev.includes(name) ? prev : [...prev, name]);
            setCurrentSheet(name);
        }
    };

    const handleImageUpload = (e) => {
        const img = e.target.files?.[0];
        if (img) { setReferenceImage(img); setReferenceImagePreview(URL.createObjectURL(img)); }
    };
    const clearImage = () => {
        setReferenceImage(null);
        setReferenceImagePreview('');
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploadLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post(`${API_URL}/excel/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const sid = res.data.session_id;
            localStorage.setItem('excelSessionId', sid);
            localStorage.setItem('filename', res.data.filename || file.name);
            setSessionId(sid);
            setFilename(res.data.filename || file.name);
            setSheetJson(res.data.sheet_json || {});
            setSheetNames(Array.isArray(res.data.sheet_names) ? res.data.sheet_names : []);
            setCurrentSheet((Array.isArray(res.data.sheet_names) && res.data.sheet_names[0]) || '');
            setMessages((prev) => [...prev, { role: 'assistant', text: `Loaded "${res.data.filename}" successfully. You can now ask me anything about your data.` }]);
            setStatusText('Workbook loaded');
            setDownloadUrl('');
        } catch (err) {
            const msg = err.response?.data?.detail || err.message;
            setMessages((prev) => [...prev, { role: 'assistant', text: `Upload failed: ${msg}`, isError: true }]);
            setStatusText('Upload failed');
        } finally {
            setUploadLoading(false);
        }
    };

    const runGemini = async (rawQuery) => {
        if (!rawQuery.trim() || !sessionId || chatLoading) return;
        const userText = rawQuery.trim();
        let finalPrompt = `${userText}\nTemplate: ${selectedTemplate}`;
        if (referenceImage) finalPrompt += `\n[User attached a reference design image for visual guidance]`;

        const userMsg = { role: 'user', text: userText };
        if (referenceImagePreview) userMsg.imageUrl = referenceImagePreview;

        setMessages((prev) => [...prev, userMsg]);
        setPrompt('');
        if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
        setChatLoading(true);
        setStatusText('Analyzing...');
        try {
            const res = await axios.post(`${API_URL}/excel/ai`, {
                session_id: sessionId,
                message: finalPrompt,
                sheet_json: sheetJson,
            });
            const result = res.data.result || {};
            const explanation = result.explanation || 'Completed.';
            const changes = Array.isArray(res.data.changes_made) ? res.data.changes_made : [];
            const charts = Array.isArray(res.data.charts_created) ? res.data.charts_created : [];
            const dashboardSummary = res.data.dashboard_summary || null;
            const changedSheets = Array.isArray(res.data.changed_sheets) ? res.data.changed_sheets : [];

            const richMsg = {
                role: 'assistant',
                text: explanation,
                changes: changes.length > 0 ? changes : undefined,
                charts: charts.length > 0 ? charts : undefined,
                dashboardSummary: dashboardSummary?.created ? dashboardSummary : undefined,
            };
            setMessages((prev) => [...prev, richMsg]);
            setStatusText('Done');
            if (changes.length > 0) {
                const updatedCells = new Set(
                    changes
                        .filter((change) => change?.sheet && change?.cell)
                        .map((change) => `${change.sheet}!${String(change.cell).toUpperCase()}`)
                );
                setRecentChangedCells(updatedCells);
                window.setTimeout(() => setRecentChangedCells(new Set()), 2200);
            }

            if (res.data.updated_sheet_json) {
                setSheetJson(res.data.updated_sheet_json);
                const newSheets = Object.keys(res.data.updated_sheet_json);
                setSheetNames(newSheets);
                const preferredSheet = changedSheets.find((name) => newSheets.includes(name));
                if (preferredSheet) {
                    setCurrentSheet(preferredSheet);
                }
            }

            if (res.data.download_url) {
                setDownloadUrl(res.data.download_url);
                localStorage.setItem('downloadUrl', res.data.download_url);
            }
        } catch (err) {
            const msg = err.response?.data?.detail || err.message;
            setMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${msg}`, isError: true }]);
            setStatusText('Failed');
        } finally {
            setChatLoading(false);
            clearImage();
        }
    };

    const handleSend = async () => {
        if (!prompt.trim()) return;
        await runGemini(prompt.trim());
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
            {/* Header */}
            <header className="glass px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3 min-w-0">
                    <img src={AxelLogo} alt="Axel AI" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-contain shrink-0" />
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 flex-wrap" style={{ color: 'var(--text-primary)' }}>
                            Axel <span className="text-teal-500">AI</span> Studio
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-900/40 text-teal-400 border border-teal-700/40 font-medium hidden sm:inline">Gemini 2.5 Flash</span>
                        </h1>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                            Welcome, {userName} {filename ? `| ${filename}` : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle dark={dark} toggle={toggleTheme} />
                    <button onClick={handleLogout} className="px-3 sm:px-4 py-2 hover:text-red-400 rounded-lg transition-all text-sm shrink-0" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="h-[calc(100vh-56px)] p-2 sm:p-3">
                <div ref={containerRef} className="h-full flex flex-col xl:flex-row gap-2 sm:gap-3">
                    {/* Left pane: Excel workspace */}
                    <section
                        className="rounded-2xl overflow-hidden flex flex-col min-h-[300px] sm:min-h-[350px]"
                        style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', width: '100%', flexBasis: `${leftPaneWidth}%` }}
                    >
                        <div className="p-3 sm:p-4" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
                            <h2 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Axel AI Workspace</h2>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Upload and inspect workbook sheet data.</p>
                            <div className="mt-3 flex flex-wrap gap-2 items-center">
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="block w-full sm:w-auto text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-teal-600/20 file:text-teal-400 file:font-medium hover:file:bg-teal-600/30 file:cursor-pointer file:text-xs"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || uploadLoading}
                                    className={`px-4 py-2 rounded-lg font-semibold text-white text-sm transition ${!file || uploadLoading ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-teal-600 hover:bg-teal-700 shadow-sm'}`}
                                >
                                    {uploadLoading ? 'Uploading...' : 'Upload'}
                                </button>
                                {sheetNames.length > 0 && (
                                    <select
                                        value={currentSheet}
                                        onChange={(e) => setCurrentSheet(e.target.value)}
                                        className="px-2 py-1.5 text-sm rounded-lg"
                                        style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                    >
                                        {sheetNames.map((name) => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Dataset Stats */}
                        {datasetStats && (
                            <div className="px-3 sm:px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                                    <AnimatedStat label="Rows" value={datasetStats.rows.toLocaleString()} icon="📋" delay={0} />
                                    <AnimatedStat label="Columns" value={datasetStats.columns} icon="📊" delay={100} />
                                    <AnimatedStat label="Cells" value={datasetStats.cells.toLocaleString()} icon="🔢" delay={200} />
                                    <AnimatedStat label="Missing" value={datasetStats.missing.toLocaleString()} icon="⚠️" delay={300} />
                                    <AnimatedStat label="Duplicates" value={datasetStats.duplicates} icon="🔁" delay={400} />
                                    <AnimatedStat label="Complete" value={`${datasetStats.completeness}%`} icon="✅" delay={500} />
                                </div>
                            </div>
                        )}

                        {/* Search Box - visible with border */}
                        {tableData.rows.length > 0 && (
                            <div className="px-3 sm:px-4 py-2" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--search-bg)', border: '1px solid var(--border-color)' }}>
                                    <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search any value in the sheet..."
                                        className="flex-1 bg-transparent text-sm focus:outline-none theme-input"
                                        style={{ color: 'var(--text-primary)' }}
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="text-xs px-2 py-0.5 rounded hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>Clear</button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Table preview */}
                        <div className="flex-1 overflow-auto">
                            {tableData.rows.length > 0 ? (
                                <table className="min-w-full text-xs">
                                    <thead className="sticky top-0 z-10" style={{ background: 'var(--card-bg)' }}>
                                        <tr>
                                            <th className="px-2 py-2 text-left text-teal-500 font-semibold text-[11px] whitespace-nowrap" style={{ borderBottom: '1px solid var(--border-color)' }}>#</th>
                                            {tableData.columns.map((col) => (
                                                <th key={col} className="px-2 py-2 text-left text-teal-500 font-semibold text-[11px] whitespace-nowrap" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRows.slice(0, 500).map((row, rowIdx) => (
                                            <tr key={`row-${rowIdx}`} className="hover:opacity-80 transition-colors" style={{ background: rowIdx % 2 === 0 ? 'var(--panel-bg)' : 'transparent' }}>
                                                <td className="px-2 py-1 text-[11px] whitespace-nowrap font-mono" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>{rowIdx + 1}</td>
                                                {tableData.columns.map((col, colIdx) => {
                                                    const rowNumber = Number(row.__rowNumber || rowIdx + 2);
                                                    const coord = `${indexToCol(colIdx + 1)}${rowNumber}`;
                                                    const changed = recentChangedCells.has(`${currentSheet}!${coord}`);
                                                    return (
                                                        <td
                                                            key={`${rowIdx}-${col}`}
                                                            className={`px-2 py-1 max-w-[200px] truncate text-[11px] whitespace-nowrap ${changed ? 'cell-change-flash' : ''}`}
                                                            style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}
                                                        >
                                                            {row[col] === null || row[col] === undefined ? '' : String(row[col])}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'var(--card-bg)' }}>📄</div>
                                    <p className="text-sm">No rows to display. Upload a workbook.</p>
                                </div>
                            )}
                        </div>

                        {/* Table footer with row count */}
                        {tableData.rows.length > 0 && (
                            <div className="px-3 py-1.5 flex items-center justify-between text-[11px]" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-muted)' }}>
                                <span>
                                    {searchTerm
                                        ? `${filteredRows.length} of ${tableData.rows.length} rows`
                                        : `${tableData.rows.length} rows | ${tableData.columns.length} columns`}
                                </span>
                                <span>{currentSheet}</span>
                            </div>
                        )}
                    </section>

                    {/* Resizer */}
                    <div
                        className="hidden xl:flex w-2 items-center justify-center cursor-col-resize group"
                        onMouseDown={() => setIsResizing(true)}
                        title="Drag to resize panels"
                    >
                        <div className="w-1 h-12 rounded-full group-hover:bg-teal-500 transition-colors" style={{ background: 'var(--border-color)' }} />
                    </div>

                    {/* Right pane: AI Chat */}
                    <section className="rounded-2xl flex-1 overflow-hidden flex flex-col min-h-[300px] sm:min-h-[350px]" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
                        <div className="px-3 sm:px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Axel AI Chat</h2>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-teal-900/40 text-teal-400 border border-teal-700/40 font-medium truncate max-w-[160px]">
                                    {statusText}
                                </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {TEMPLATES.map((tpl) => (
                                    <button
                                        key={tpl}
                                        type="button"
                                        onClick={() => setSelectedTemplate(tpl)}
                                        className={`px-2 py-1 text-xs rounded-full border transition ${
                                            selectedTemplate === tpl
                                                ? 'bg-teal-600 text-white border-teal-600'
                                                : 'hover:opacity-80'
                                        }`}
                                        style={selectedTemplate !== tpl ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : undefined}
                                    >
                                        {tpl[0].toUpperCase() + tpl.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                            {messages.map((m, idx) => (
                                <RichMessage key={idx} msg={m} onSwitchSheet={switchToSheet} />
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="rounded-xl p-3" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            <span className="inline-block w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                                            AI is analyzing your spreadsheet...
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input area */}
                        <div className="p-3" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
                            {referenceImagePreview && (
                                <div className="mb-2 flex items-center gap-2 p-2 bg-teal-900/30 rounded-lg border border-teal-700/40">
                                    <img src={referenceImagePreview} alt="Reference" className="h-10 w-10 rounded-lg object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-teal-400 font-medium">Reference design attached</p>
                                        <p className="text-[10px] text-teal-500 truncate">{referenceImage?.name}</p>
                                    </div>
                                    <button type="button" onClick={clearImage} className="text-teal-500 hover:text-red-400 text-sm font-bold px-2">✕</button>
                                </div>
                            )}
                            {downloadUrl && (
                                <div className="mb-2">
                                    <button
                                        type="button"
                                        onClick={() => window.open(downloadUrl, '_blank')}
                                        className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors"
                                    >
                                        Download Updated Excel
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-2 items-end">
                                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl transition-all self-end hover:opacity-80"
                                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                                    title="Attach reference image"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                                <textarea
                                    ref={textareaRef}
                                    value={prompt}
                                    onChange={(e) => { setPrompt(e.target.value); autoResize(e.target); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    disabled={!sessionId || chatLoading}
                                    placeholder="Ask Axel AI about your spreadsheet..."
                                    rows={1}
                                    className="flex-1 px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-sm resize-none theme-input"
                                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', minHeight: '40px', maxHeight: '120px' }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!sessionId || !prompt.trim() || chatLoading}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm shrink-0 self-end"
                                >
                                    {chatLoading ? '...' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
