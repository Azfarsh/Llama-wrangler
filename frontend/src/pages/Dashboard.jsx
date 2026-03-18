import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AxelLogo from '../assets/Axellogo.png';

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

function AnimatedStat({ label, value, icon, delay = 0 }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(t);
    }, [delay]);
    return (
        <div className={`bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{icon}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function MiniTable({ data, title, maxRows = 10 }) {
    if (!data || !data.columns?.length || !data.rows?.length) return null;
    const visibleRows = data.rows.slice(0, maxRows);
    return (
        <div className="mt-3">
            {title && <p className="text-xs font-semibold text-teal-700 mb-1">{title}</p>}
            <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-[260px] overflow-y-auto">
                <table className="min-w-full text-xs">
                    <thead className="sticky top-0 bg-teal-50 z-10">
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
                            <tr key={ri} className="odd:bg-white even:bg-gray-50/60 hover:bg-teal-50/40">
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
                <div key={i} className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-teal-600 font-medium uppercase tracking-wide">{kpi.label}</p>
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
                        <span className="font-mono text-teal-700">{c.sheet}!{c.cell}</span>
                        <span className="text-gray-400">{String(c.before ?? '(empty)')}</span>
                        <span className="text-gray-500">&rarr;</span>
                        <span className="text-gray-800 font-medium truncate max-w-[160px]">{String(c.after ?? '(empty)')}</span>
                    </div>
                ))}
            </div>
            {changes.length > 5 && (
                <button type="button" onClick={() => setExpanded(!expanded)} className="text-[10px] text-teal-600 hover:underline mt-1">
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
                    <div key={i} className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5">
                        <span className="w-6 h-6 flex items-center justify-center rounded bg-teal-200 text-teal-800 text-[10px] font-bold">
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
        <div className="mt-3 flex items-center gap-2 bg-teal-50 border border-teal-300 rounded-lg px-3 py-2">
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-200 text-teal-800 text-xs font-bold">D</span>
            <div className="flex-1">
                <p className="text-xs font-semibold text-teal-800">Dashboard Created: {summary.sheet}</p>
                <p className="text-[10px] text-gray-600">{summary.elements} element(s)</p>
            </div>
            {onSwitch && (
                <button type="button" onClick={onSwitch} className="text-[10px] bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700">
                    View
                </button>
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
                <div className="max-w-[85%] rounded-xl p-3 text-sm whitespace-pre-wrap bg-teal-600 text-white">
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
                <div className="p-3 text-sm whitespace-pre-wrap text-gray-800">{msg.text}</div>
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

    const [referenceImage, setReferenceImage] = useState(null);
    const [referenceImagePreview, setReferenceImagePreview] = useState('');
    const imageInputRef = useRef(null);

    const [datasetStats, setDatasetStats] = useState(null);

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

    useEffect(() => {
        if (tableData.rows.length > 0) {
            const totalCells = tableData.rows.length * tableData.columns.length;
            let missing = 0;
            let duplicates = 0;
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

    const handleImageUpload = (e) => {
        const img = e.target.files?.[0];
        if (img) {
            setReferenceImage(img);
            setReferenceImagePreview(URL.createObjectURL(img));
        }
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
        let finalPrompt = `${userText}\nTemplate: ${selectedTemplate}\nCreate charts and dashboard if useful.`;

        if (referenceImage) {
            finalPrompt += `\n[User attached a reference design image for visual guidance]`;
        }

        const userMsg = { role: 'user', text: userText };
        if (referenceImagePreview) {
            userMsg.imageUrl = referenceImagePreview;
        }

        setMessages((prev) => [...prev, userMsg]);
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
            clearImage();
        }
    };

    const handleSend = async () => {
        if (!prompt.trim()) return;
        await runGemini(prompt.trim());
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="glass border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <img src={AxelLogo} alt="Axel AI" className="h-9 w-9 rounded-xl object-contain" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Axel <span className="text-teal-600">AI</span> Studio
                            <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-200 font-medium">Gemini 2.5 Flash</span>
                        </h1>
                        <p className="text-xs text-gray-500">
                            Welcome, {userName} {filename ? `| ${filename}` : ''}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg hover:bg-red-50 transition-all text-sm"
                >
                    Logout
                </button>
            </header>

            <main className="h-[calc(100vh-64px)] p-3">
                <div ref={containerRef} className="h-full flex flex-col xl:flex-row gap-3">
                    {/* Left pane: Excel workspace */}
                    <section
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[350px]"
                        style={{ width: '100%', flexBasis: `${leftPaneWidth}%` }}
                    >
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-semibold text-gray-900">Excel Workspace</h2>
                            <p className="text-xs text-gray-500">Upload and inspect workbook sheet data.</p>
                            <div className="mt-3 flex flex-wrap gap-2 items-center">
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="block w-full md:w-auto text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:font-medium hover:file:bg-teal-100 file:cursor-pointer"
                                />
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || uploadLoading}
                                    className={`px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition ${
                                        !file || uploadLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 shadow-sm'
                                    }`}
                                >
                                    {uploadLoading ? 'Uploading...' : 'Upload Excel'}
                                </button>
                                {sheetNames.length > 0 && (
                                    <select
                                        value={currentSheet}
                                        onChange={(e) => setCurrentSheet(e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                                    >
                                        {sheetNames.map((name) => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Animated Dataset Stats */}
                        {datasetStats && (
                            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-white">
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    <AnimatedStat label="Rows" value={datasetStats.rows.toLocaleString()} icon="📋" delay={0} />
                                    <AnimatedStat label="Columns" value={datasetStats.columns} icon="📊" delay={100} />
                                    <AnimatedStat label="Cells" value={datasetStats.cells.toLocaleString()} icon="🔢" delay={200} />
                                    <AnimatedStat label="Missing" value={datasetStats.missing.toLocaleString()} icon="⚠️" delay={300} />
                                    <AnimatedStat label="Duplicates" value={datasetStats.duplicates} icon="🔁" delay={400} />
                                    <AnimatedStat label="Complete" value={`${datasetStats.completeness}%`} icon="✅" delay={500} />
                                </div>
                            </div>
                        )}

                        {/* Table preview */}
                        <div className="flex-1 overflow-auto">
                            {tableData.rows.length > 0 ? (
                                <table className="min-w-full text-sm">
                                    <thead className="sticky top-0 bg-teal-50/80 backdrop-blur z-10">
                                        <tr>
                                            {tableData.columns.map((col) => (
                                                <th key={col} className="px-3 py-2 text-left text-gray-700 font-semibold border-b border-gray-200 text-xs">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.rows.slice(0, 500).map((row, rowIdx) => (
                                            <tr key={`row-${rowIdx}`} className="odd:bg-white even:bg-gray-50/50 hover:bg-teal-50/30 transition-colors">
                                                {tableData.columns.map((col) => (
                                                    <td key={`${rowIdx}-${col}`} className="px-3 py-1.5 border-b border-gray-100 text-gray-700 max-w-[260px] truncate text-xs">
                                                        {row[col] === null || row[col] === undefined ? '' : String(row[col])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">📄</div>
                                    <p className="text-sm">No rows to display. Upload a workbook.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Resizer */}
                    <div
                        className="hidden xl:flex w-2 items-center justify-center cursor-col-resize group"
                        onMouseDown={() => setIsResizing(true)}
                        title="Drag to resize panels"
                    >
                        <div className="w-1 h-12 rounded-full bg-gray-200 group-hover:bg-teal-400 transition-colors" />
                    </div>

                    {/* Right pane: AI Chat */}
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 overflow-hidden flex flex-col min-h-[350px]">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-lg font-semibold text-gray-900">Excel AI Chat</h2>
                                <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-medium">
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
                                                ? 'bg-teal-600 text-white border-teal-600'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {tpl[0].toUpperCase() + tpl.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-white to-gray-50/50">
                            {messages.map((m, idx) => (
                                <RichMessage key={idx} msg={m} onSwitchSheet={switchToSheet} />
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="inline-block w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                                            AI is analyzing your spreadsheet...
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input area */}
                        <div className="p-3 border-t border-gray-100 bg-white">
                            {/* Reference image preview */}
                            {referenceImagePreview && (
                                <div className="mb-2 flex items-center gap-2 p-2 bg-teal-50 rounded-lg border border-teal-200">
                                    <img src={referenceImagePreview} alt="Reference" className="h-12 w-12 rounded-lg object-cover" />
                                    <div className="flex-1">
                                        <p className="text-xs text-teal-700 font-medium">Reference design attached</p>
                                        <p className="text-[10px] text-teal-600">{referenceImage?.name}</p>
                                    </div>
                                    <button type="button" onClick={clearImage} className="text-teal-500 hover:text-red-500 text-sm font-bold px-2">✕</button>
                                </div>
                            )}
                            <div className="flex gap-2 mb-2">
                                {downloadUrl && (
                                    <button
                                        type="button"
                                        onClick={() => window.open(downloadUrl, '_blank')}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors"
                                    >
                                        Download Updated Excel
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setPrompt('Create a professional dashboard with KPI cards and charts for this workbook')}
                                    className="px-3 py-2 border border-teal-200 text-teal-700 rounded-lg text-xs hover:bg-teal-50 font-medium"
                                >
                                    Generate Dashboard
                                </button>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 font-medium flex items-center gap-1"
                                    title="Upload a reference design image"
                                >
                                    🖼️ Reference Image
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    disabled={!sessionId || chatLoading}
                                    placeholder="Ask: explain this spreadsheet, add totals, create dashboard, design like my image..."
                                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-sm"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!sessionId || !prompt.trim() || chatLoading}
                                    className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 transition-all shadow-sm text-sm"
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
