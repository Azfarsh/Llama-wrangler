import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TEMPLATES = ['executive', 'sales', 'operations', 'finance'];

function colToIndex(col) {
    let out = 0;
    for (let i = 0; i < col.length; i += 1) {
        out = out * 26 + (col.charCodeAt(i) - 64);
    }
    return out;
}

function parseCellRef(cell) {
    const m = /^([A-Z]+)(\d+)$/.exec(String(cell || '').toUpperCase());
    if (!m) return null;
    return { col: colToIndex(m[1]), row: Number(m[2]) };
}

function sheetJsonToTable(sheetMap) {
    const entries = Object.entries(sheetMap || {});
    if (!entries.length) return { columns: [], rows: [] };
    let maxRow = 1;
    let maxCol = 1;
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
        const headerValue = cell ? sheetMap[cell]?.value : '';
        headers.push(String(headerValue || `Column ${c}`));
    }
    const rows = [];
    for (let r = 2; r <= maxRow; r += 1) {
        const rowObj = {};
        let nonEmpty = false;
        for (let c = 1; c <= maxCol; c += 1) {
            const match = Object.keys(sheetMap).find((k) => {
                const p = parseCellRef(k);
                return p && p.row === r && p.col === c;
            });
            const value = match ? sheetMap[match]?.value : '';
            rowObj[headers[c - 1]] = value ?? '';
            if (value !== '' && value !== null && value !== undefined) nonEmpty = true;
        }
        if (nonEmpty) rows.push(rowObj);
    }
    return { columns: headers, rows };
}

const CHART_ICONS = { bar: 'B', line: 'L', pie: 'P' };

function MiniTable({ data, title, maxRows = 10 }) {
    if (!data || !data.columns?.length || !data.rows?.length) return null;
    const visibleRows = data.rows.slice(0, maxRows);
    return (
        <div className="mt-3">
            {title && <p className="text-xs font-semibold text-emerald-700 mb-1">{title}</p>}
            <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-[260px] overflow-y-auto">
                <table className="min-w-full text-xs">
                    <thead className="sticky top-0 bg-emerald-50 z-10">
                        <tr>
                            {data.columns.map((col) => (
                                <th key={col} className="px-2 py-1.5 text-left text-gray-700 font-semibold border-b border-gray-200 whitespace-nowrap">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleRows.map((row, ri) => (
                            <tr key={ri} className="odd:bg-white even:bg-gray-50/60 hover:bg-emerald-50/40">
                                {data.columns.map((col) => (
                                    <td key={`${ri}-${col}`} className="px-2 py-1 border-b border-gray-100 text-gray-700 max-w-[180px] truncate whitespace-nowrap">
                                        {row[col] === null || row[col] === undefined ? '' : String(row[col])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.rows.length > maxRows && (
                <p className="text-[10px] text-gray-400 mt-1">Showing {maxRows} of {data.rows.length} rows</p>
            )}
        </div>
    );
}

function KpiCards({ kpis }) {
    if (!kpis?.length) return null;
    return (
        <div className="mt-3 grid grid-cols-2 gap-2">
            {kpis.map((kpi, i) => (
                <div key={i} className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">{kpi.label}</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{kpi.formula || kpi.value || '--'}</p>
                </div>
            ))}
        </div>
    );
}

function ChangeLog({ changes }) {
    const [expanded, setExpanded] = useState(false);
    if (!changes?.length) return null;
    const visible = expanded ? changes : changes.slice(0, 5);
    return (
        <div className="mt-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">Changes Applied ({changes.length})</p>
            <div className="space-y-1">
                {visible.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] bg-gray-50 rounded px-2 py-1">
                        <span className="font-mono text-emerald-700">{c.sheet}!{c.cell}</span>
                        <span className="text-gray-400">{String(c.before ?? '(empty)')}</span>
                        <span className="text-gray-500">&rarr;</span>
                        <span className="text-gray-800 font-medium truncate max-w-[160px]">{String(c.after ?? '(empty)')}</span>
                    </div>
                ))}
            </div>
            {changes.length > 5 && (
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="text-[10px] text-emerald-600 hover:underline mt-1"
                >
                    {expanded ? 'Show less' : `Show all ${changes.length} changes`}
                </button>
            )}
        </div>
    );
}

function ChartCards({ charts }) {
    if (!charts?.length) return null;
    return (
        <div className="mt-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">Charts Created</p>
            <div className="flex flex-wrap gap-2">
                {charts.map((ch, i) => (
                    <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                        <span className="w-6 h-6 flex items-center justify-center rounded bg-blue-200 text-blue-800 text-[10px] font-bold">
                            {CHART_ICONS[ch.type] || 'C'}
                        </span>
                        <div>
                            <p className="text-xs font-medium text-gray-800">{ch.title}</p>
                            <p className="text-[10px] text-gray-500">{ch.type} chart on {ch.sheet}</p>
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
        <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2">
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold">D</span>
            <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-800">Dashboard Created: {summary.sheet}</p>
                <p className="text-[10px] text-gray-600">{summary.elements} element(s)</p>
            </div>
            {onSwitch && (
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
                >
                    View
                </button>
            )}
        </div>
    );
}

function RichMessage({ msg, onSwitchSheet }) {
    if (msg.role === 'user') {
        return (
            <div className="flex justify-end">
                <div className="max-w-[85%] rounded-xl p-3 text-sm whitespace-pre-wrap bg-emerald-600 text-white">
                    {msg.text}
                </div>
            </div>
        );
    }

    if (msg.isError) {
        return (
            <div className="flex justify-start">
                <div className="max-w-[95%] rounded-xl p-3 text-sm whitespace-pre-wrap bg-red-50 text-red-800 border border-red-200">
                    {msg.text}
                </div>
            </div>
        );
    }

    const hasRichContent = msg.previewTable || msg.changes?.length || msg.charts?.length || msg.dashboardSummary?.created || msg.dashboardPreview;
    if (!hasRichContent) {
        return (
            <div className="flex justify-start">
                <div className="max-w-[95%] rounded-xl p-3 text-sm whitespace-pre-wrap bg-white border border-gray-200 text-gray-800 shadow-sm">
                    {msg.text}
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start">
            <div className="max-w-[95%] w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-3 text-sm whitespace-pre-wrap text-gray-800">
                    {msg.text}
                </div>
                <div className="px-3 pb-3 space-y-1">
                    <KpiCards kpis={msg.dashboardSummary?.kpis} />
                    <ChartCards charts={msg.charts} />
                    <DashboardBadge
                        summary={msg.dashboardSummary}
                        onSwitch={msg.dashboardSummary?.sheet ? () => onSwitchSheet(msg.dashboardSummary.sheet) : null}
                    />
                    <ChangeLog changes={msg.changes} />
                    <MiniTable data={msg.dashboardPreview} title={`Dashboard Preview: ${msg.dashboardSummary?.sheet || 'Dashboard'}`} maxRows={12} />
                    <MiniTable data={msg.previewTable} title={`Data Preview: ${msg.previewTable?.sheet || 'Sheet'}`} maxRows={10} />
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'User';

    const [file, setFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([{ role: 'assistant', text: 'Upload an Excel (.xlsx) file to begin.' }]);
    const [statusText, setStatusText] = useState('Waiting for Excel upload.');

    const [sessionId, setSessionId] = useState(localStorage.getItem('excelSessionId') || '');
    const [filename, setFilename] = useState(localStorage.getItem('filename') || '');
    const [downloadUrl, setDownloadUrl] = useState(localStorage.getItem('downloadUrl') || '');
    const [sheetJson, setSheetJson] = useState({});
    const [sheetNames, setSheetNames] = useState([]);
    const [currentSheet, setCurrentSheet] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('operations');

    const [leftPaneWidth, setLeftPaneWidth] = useState(55);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (event) => {
            if (!isResizing || !containerRef.current) return;
            const bounds = containerRef.current.getBoundingClientRect();
            const pct = ((event.clientX - bounds.left) / bounds.width) * 100;
            setLeftPaneWidth(Math.max(30, Math.min(70, pct)));
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

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        navigate('/');
    };

    const switchToSheet = (name) => {
        if (name && sheetNames.includes(name)) {
            setCurrentSheet(name);
        } else if (name) {
            setSheetNames((prev) => prev.includes(name) ? prev : [...prev, name]);
            setCurrentSheet(name);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploadLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post(`${API_URL}/excel/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const sid = res.data.session_id;
            localStorage.setItem('excelSessionId', sid);
            localStorage.setItem('filename', res.data.filename || file.name);
            setSessionId(sid);
            setFilename(res.data.filename || file.name);
            setSheetJson(res.data.sheet_json || {});
            setSheetNames(Array.isArray(res.data.sheet_names) ? res.data.sheet_names : []);
            setCurrentSheet((Array.isArray(res.data.sheet_names) && res.data.sheet_names[0]) || '');
            setMessages((prev) => [...prev, { role: 'assistant', text: `Loaded ${res.data.filename}. Ask me anything about your Excel.` }]);
            setStatusText('Excel uploaded. Gemini is ready.');
            setDownloadUrl('');
        } catch (err) {
            const msg = err.response?.data?.detail || err.message;
            setMessages((prev) => [...prev, { role: 'assistant', text: `Upload failed: ${msg}`, isError: true }]);
            setStatusText('Upload failed.');
        } finally {
            setUploadLoading(false);
        }
    };

    const runGemini = async (rawQuery) => {
        if (!rawQuery.trim() || !sessionId || chatLoading) return;
        const userText = rawQuery.trim();
        const finalPrompt = `${userText}\nTemplate: ${selectedTemplate}\nCreate charts and dashboard if useful.`;

        setMessages((prev) => [...prev, { role: 'user', text: userText }]);
        setPrompt('');
        setChatLoading(true);
        setStatusText('AI is analyzing your spreadsheet...');
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
            const previewTable = res.data.preview_table || null;
            const dashboardPreview = res.data.dashboard_preview || null;

            const richMsg = {
                role: 'assistant',
                text: explanation,
                changes: changes.length > 0 ? changes : undefined,
                charts: charts.length > 0 ? charts : undefined,
                dashboardSummary: dashboardSummary?.created ? dashboardSummary : undefined,
                previewTable: previewTable?.rows?.length > 0 ? previewTable : undefined,
                dashboardPreview: dashboardPreview?.rows?.length > 0 ? dashboardPreview : undefined,
            };
            setMessages((prev) => [...prev, richMsg]);
            setStatusText('Done.');

            if (res.data.updated_sheet_json) {
                setSheetJson(res.data.updated_sheet_json);
                const newSheets = Object.keys(res.data.updated_sheet_json);
                setSheetNames(newSheets);
                if (dashboardSummary?.created && dashboardSummary.sheet && newSheets.includes(dashboardSummary.sheet)) {
                    setCurrentSheet(dashboardSummary.sheet);
                }
            }

            if (res.data.download_url) {
                setDownloadUrl(res.data.download_url);
                localStorage.setItem('downloadUrl', res.data.download_url);
            }
        } catch (err) {
            const msg = err.response?.data?.detail || err.message;
            setMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${msg}`, isError: true }]);
            setStatusText('Failed.');
        } finally {
            setChatLoading(false);
        }
    };

    const handleSend = async () => {
        if (!prompt.trim()) return;
        await runGemini(prompt.trim());
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
            <header className="bg-white/90 backdrop-blur shadow-sm border-b border-emerald-100 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-700">Excel AI Agent Studio (Gemini 2.5 Flash)</h1>
                    <p className="text-sm text-gray-600">
                        Welcome back, {userName}! {filename ? `Current file: ${filename}` : 'Upload a .xlsx file to begin.'}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-gray-600 hover:text-red-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Logout
                </button>
            </header>

            <main className="h-[calc(100vh-82px)] p-4 md:p-6">
                <div ref={containerRef} className="h-full flex flex-col xl:flex-row gap-3">
                    <section
                        className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden flex flex-col min-h-[350px]"
                        style={{ width: '100%', flexBasis: `${leftPaneWidth}%` }}
                    >
                        <div className="p-4 border-b border-emerald-100">
                            <h2 className="text-xl font-semibold text-gray-900">Excel Workspace</h2>
                            <p className="text-sm text-gray-600">Upload and inspect workbook sheet data.</p>
                            <div className="mt-3 flex flex-wrap gap-2 items-center">
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="block w-full md:w-auto text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
                                />
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || uploadLoading}
                                    className={`px-5 py-2.5 rounded-lg font-semibold text-white transition ${
                                        !file || uploadLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                                >
                                    {uploadLoading ? 'Uploading...' : 'Upload Excel'}
                                </button>
                                {sheetNames.length > 0 && (
                                    <select
                                        value={currentSheet}
                                        onChange={(e) => setCurrentSheet(e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                    >
                                        {sheetNames.map((name) => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            {tableData.rows.length > 0 ? (
                                <table className="min-w-full text-sm">
                                    <thead className="sticky top-0 bg-emerald-100 z-10">
                                        <tr>
                                            {tableData.columns.map((col) => (
                                                <th key={col} className="px-3 py-2 text-left text-gray-700 font-semibold border-b border-gray-200">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.rows.slice(0, 500).map((row, rowIdx) => (
                                            <tr key={`row-${rowIdx}`} className="odd:bg-white even:bg-emerald-50/40 hover:bg-emerald-50">
                                                {tableData.columns.map((col) => (
                                                    <td key={`${rowIdx}-${col}`} className="px-3 py-2 border-b border-gray-100 text-gray-700 max-w-[260px] truncate">
                                                        {row[col] === null || row[col] === undefined ? '' : String(row[col])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    No rows to display. Upload a workbook to continue.
                                </div>
                            )}
                        </div>
                    </section>

                    <div
                        className="hidden xl:block w-2 rounded bg-emerald-100 hover:bg-emerald-200 cursor-col-resize"
                        onMouseDown={() => setIsResizing(true)}
                        title="Drag to resize panels"
                    />

                    <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm flex-1 overflow-hidden flex flex-col min-h-[350px]">
                        <div className="px-4 py-3 border-b border-emerald-100 bg-white">
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-lg font-semibold text-gray-900">Excel AI Chat</h2>
                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {statusText}
                                </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {TEMPLATES.map((tpl) => (
                                    <button
                                        key={tpl}
                                        type="button"
                                        onClick={() => setSelectedTemplate(tpl)}
                                        className={`px-2.5 py-1.5 text-xs rounded-full border transition ${
                                            selectedTemplate === tpl
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {tpl[0].toUpperCase() + tpl.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-white to-emerald-50/30">
                            {messages.map((m, idx) => (
                                <RichMessage key={idx} msg={m} onSwitchSheet={switchToSheet} />
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            AI is analyzing your spreadsheet...
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 border-t border-emerald-100 bg-white">
                            <div className="flex gap-2 mb-2">
                                {downloadUrl && (
                                    <button
                                        type="button"
                                        onClick={() => window.open(downloadUrl, '_blank')}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                                    >
                                        Download Updated Excel
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setPrompt('Create a professional dashboard with KPI cards and charts for this workbook')}
                                    className="px-3 py-2 border border-emerald-200 text-emerald-700 rounded-lg text-sm hover:bg-emerald-50"
                                >
                                    Generate Dashboard
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    disabled={!sessionId || chatLoading}
                                    placeholder="Ask: explain this spreadsheet, add totals, create dashboard, find errors..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!sessionId || !prompt.trim() || chatLoading}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {chatLoading ? 'Running...' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

        </div>
    );
}
