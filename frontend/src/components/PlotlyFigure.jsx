import React from 'react';
import Plot from 'react-plotly.js';

export default function PlotlyFigure({ figure, title, className = '' }) {
    if (!figure?.data) return null;
    const layout = {
        ...(figure.layout || {}),
        title: title
            ? { text: title, font: { size: 13, color: 'var(--text-primary)' } }
            : figure.layout?.title,
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'rgba(0,0,0,0.06)',
        autosize: true,
        font: { color: 'var(--text-secondary)', size: 11 },
        margin: { t: title ? 40 : 28, r: 12, b: 40, l: 48 },
    };
    return (
        <div className={`w-full min-h-[200px] ${className}`}>
            <Plot
                data={figure.data}
                layout={layout}
                config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                style={{ width: '100%', height: '100%', minHeight: 200 }}
                useResizeHandler
            />
        </div>
    );
}
