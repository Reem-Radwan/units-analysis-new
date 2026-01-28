
// import React, { useMemo, useState } from 'react';

// const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// const Chart = ({ title, data, filterInfo, valueFormatter }) => {
//   const [tooltip, setTooltip] = useState(null);

//   const handleRectangleHover = (event, barData) => {
//     const rect = event.currentTarget.getBoundingClientRect();
//     setTooltip({
//       x: rect.right + 10,
//       y: rect.top,
//       data: barData
//     });
//   };

//   const handleRectangleLeave = () => setTooltip(null);

//   /**
//    * Build everything with useMemo FIRST (hooks must not be conditional)
//    * If data is empty, we return safe empty structures.
//    */
//   const {
//     finishingSpans,
//     flattenedColumns,
//     maxValue
//   } = useMemo(() => {
//     const safeData = Array.isArray(data) ? data : [];

//     // Group: finishing -> developer -> project -> payment
//     const hierarchicalData = {};
//     safeData.forEach(item => {
//       const finishing = item.finishing || 'Unknown';
//       const developer = item.developer || 'Unknown';
//       const project = item.project || 'Unknown';
//       const payment = item.payment || 'Unknown';

//       hierarchicalData[finishing] ??= {};
//       hierarchicalData[finishing][developer] ??= {};
//       hierarchicalData[finishing][developer][project] ??= [];

//       hierarchicalData[finishing][developer][project].push({
//         payment,
//         max: Number(item.max) || 0,
//         avg: Number(item.avg) || 0,
//         min: Number(item.min) || 0,
//         fullData: item
//       });
//     });

//     // Flatten + spans
//     const finishingSpansLocal = [];
//     const flattenedColumnsLocal = [];

//     Object.keys(hierarchicalData).forEach(finishing => {
//       let finishingColCount = 0;
//       const developerSpans = [];

//       Object.keys(hierarchicalData[finishing]).forEach(developer => {
//         let developerColCount = 0;
//         const projectSpans = [];

//         Object.keys(hierarchicalData[finishing][developer]).forEach(project => {
//           const payments = hierarchicalData[finishing][developer][project];

//           payments.forEach(paymentData => {
//             flattenedColumnsLocal.push({
//               finishing,
//               developer,
//               project,
//               payment: paymentData.payment,
//               max: paymentData.max,
//               avg: paymentData.avg,
//               min: paymentData.min,
//               fullData: paymentData.fullData
//             });
//             developerColCount++;
//             finishingColCount++;
//           });

//           projectSpans.push({ label: project, span: payments.length });
//         });

//         developerSpans.push({
//           label: developer,
//           span: developerColCount,
//           projects: projectSpans
//         });
//       });

//       finishingSpansLocal.push({
//         label: finishing,
//         span: finishingColCount,
//         developers: developerSpans
//       });
//     });

//     const allValues = flattenedColumnsLocal.flatMap(c => [c.max, c.avg, c.min]);
//     const maxValueLocal = Math.max(1, ...allValues); // avoid divide by 0

//     return {
//       finishingSpans: finishingSpansLocal,
//       flattenedColumns: flattenedColumnsLocal,
//       maxValue: maxValueLocal
//     };
//   }, [data]);

//   // ✅ Now it's safe to early return (hooks already ran)
//   if (!data || data.length === 0) {
//     return (
//       <div className="chart-section">
//         <div className="chart-header">
//           <h3 className="chart-title">{title}</h3>
//           {filterInfo && <div className="chart-filters-info">{filterInfo}</div>}
//         </div>
//         <div className="empty-state">
//           <div className="empty-state-icon">📊</div>
//           <div className="empty-state-text">No data available for the selected filters</div>
//         </div>
//       </div>
//     );
//   }

//   // Chart layout constants (match your CSS)
//   const STACK_HEIGHT = 320;
//   const RECT_H = 36;
//   const RECT_HALF = RECT_H / 2;
//   const TOP_PAD = 8;
//   const BOTTOM_PAD = 8;

//   // Convert value -> y (0 top, STACK_HEIGHT bottom). Higher value => higher position.
//   const yFromValue = (value) => {
//     const pct = clamp(value / maxValue, 0, 1);
//     const usable = STACK_HEIGHT - TOP_PAD - BOTTOM_PAD;
//     return TOP_PAD + (1 - pct) * usable;
//   };

//   return (
//     <div className="chart-section">
//       <div className="chart-header">
//         <h3 className="chart-title">{title}</h3>
//         {filterInfo && <div className="chart-filters-info">{filterInfo}</div>}
//       </div>

//       <div className="chart-content">
//         {/* Hierarchical X-Axis Table */}
//         <div className="chart-table-wrapper">
//           <table className="chart-x-axis-table">
//             <thead>
//               <tr className="hierarchy-level-1">
//                 <th className="fixed-label-column">Finishing</th>
//                 {finishingSpans.map((finishing, idx) => (
//                   <th key={`finishing-${idx}`} colSpan={finishing.span}>
//                     {finishing.label}
//                   </th>
//                 ))}
//               </tr>

//               <tr className="hierarchy-level-2">
//                 <th className="fixed-label-column">Developer</th>
//                 {finishingSpans.map((finishing, fIdx) =>
//                   finishing.developers.map((developer, dIdx) => (
//                     <th key={`dev-${fIdx}-${dIdx}`} colSpan={developer.span}>
//                       {developer.label}
//                     </th>
//                   ))
//                 )}
//               </tr>

//               <tr className="hierarchy-level-3">
//                 <th className="fixed-label-column">Project</th>
//                 {finishingSpans.map((finishing, fIdx) =>
//                   finishing.developers.map((developer, dIdx) =>
//                     developer.projects.map((project, pIdx) => (
//                       <th key={`proj-${fIdx}-${dIdx}-${pIdx}`} colSpan={project.span}>
//                         {project.label}
//                       </th>
//                     ))
//                   )
//                 )}
//               </tr>

//               <tr className="hierarchy-level-4">
//                 <th className="fixed-label-column">Payment</th>
//                 {flattenedColumns.map((col, idx) => (
//                   <th key={`payment-${idx}`}>{col.payment}</th>
//                 ))}
//               </tr>
//             </thead>
//           </table>
//         </div>

//         {/* Chart Visualization */}
//         <div className="chart-visualization-scroll">
//           <div className="chart-visualization">
//             {/* Fewer + lighter grid lines */}
//             <div className="chart-grid-lines">
//               {[0, 1, 2, 3, 4, 5].map(i => (
//                 <div key={i} className="grid-line" style={{ top: `${i * 20}%` }} />
//               ))}
//             </div>

//             <div className="chart-bars-container">
//               {flattenedColumns.map((item, index) => {
//                 const yMax = yFromValue(item.max);
//                 const yAvg = yFromValue(item.avg);
//                 const yMin = yFromValue(item.min);

//                 const topCenter = Math.min(yMax, yAvg, yMin) + RECT_HALF;
//                 const bottomCenter = Math.max(yMax, yAvg, yMin) + RECT_HALF;

//                 return (
//                   <div key={index} className="chart-bar-column">
//                     <div className="chart-stack" style={{ height: `${STACK_HEIGHT}px` }}>
//                       {/* Continuous connector */}
//                       <div
//                         className="value-connector"
//                         style={{
//                           top: `${topCenter}px`,
//                           height: `${Math.max(0, bottomCenter - topCenter)}px`
//                         }}
//                       />

//                       <div
//                         className="chart-rectangle max"
//                         style={{ top: `${yMax}px` }}
//                         title={valueFormatter(item.max)}
//                         onMouseEnter={(e) => handleRectangleHover(e, { type: 'Max', value: item.max, ...item })}
//                         onMouseLeave={handleRectangleLeave}
//                       >
//                         {valueFormatter(item.max)}
//                       </div>

//                       <div
//                         className="chart-rectangle avg"
//                         style={{ top: `${yAvg}px` }}
//                         title={valueFormatter(item.avg)}
//                         onMouseEnter={(e) => handleRectangleHover(e, { type: 'Avg', value: item.avg, ...item })}
//                         onMouseLeave={handleRectangleLeave}
//                       >
//                         {valueFormatter(item.avg)}
//                       </div>

//                       <div
//                         className="chart-rectangle min"
//                         style={{ top: `${yMin}px` }}
//                         title={valueFormatter(item.min)}
//                         onMouseEnter={(e) => handleRectangleHover(e, { type: 'Min', value: item.min, ...item })}
//                         onMouseLeave={handleRectangleLeave}
//                       >
//                         {valueFormatter(item.min)}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>

//       {tooltip && (
//         <div
//           className="tooltip"
//           style={{
//             left: `${tooltip.x}px`,
//             top: `${tooltip.y}px`
//           }}
//         >
//           <div className="tooltip-title">{tooltip.data.type} Value</div>

//           <div className="tooltip-item">
//             <span className="tooltip-label">Value:</span> {valueFormatter(tooltip.data.value)}
//           </div>
//           <div className="tooltip-item">
//             <span className="tooltip-label">Finishing:</span> {tooltip.data.finishing}
//           </div>
//           <div className="tooltip-item">
//             <span className="tooltip-label">Developer:</span> {tooltip.data.developer}
//           </div>
//           <div className="tooltip-item">
//             <span className="tooltip-label">Project:</span> {tooltip.data.project}
//           </div>
//           <div className="tooltip-item">
//             <span className="tooltip-label">Payment:</span> {tooltip.data.payment}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Chart;




// import React, { useMemo, useState } from 'react';

// const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// const Chart = ({ title, data, filterInfo, valueFormatter, selectedFilters }) => {
//   const [tooltip, setTooltip] = useState(null);

//   const handleHoverAny = (event, item) => {
//     const rect = event.currentTarget.getBoundingClientRect();

//     // prefer selectedFilters (from your UI), fallback to row data if exists
//     const location =
//       selectedFilters?.location?.length ? selectedFilters.location.join(', ')
//       : item.fullData?.location || item.fullData?.Location || '—';

//     const assetType =
//       selectedFilters?.assetType?.length ? selectedFilters.assetType.join(', ')
//       : item.fullData?.assetType || item.fullData?.asset_type || item.fullData?.['Asset Type'] || '—';

//     const unitType =
//       selectedFilters?.unitType?.length ? selectedFilters.unitType.join(', ')
//       : item.fullData?.unitType || item.fullData?.unit_type || item.fullData?.['Unit Type'] || '—';

//     setTooltip({
//       x: rect.right + 10,
//       y: rect.top,
//       data: {
//         finishing: item.finishing,
//         developer: item.developer,
//         project: item.project,
//         payment: item.payment,
//         min: item.min,
//         avg: item.avg,
//         max: item.max,
//         location,
//         assetType,
//         unitType
//       }
//     });
//   };

//   const handleLeave = () => setTooltip(null);

//   const { finishingSpans, flattenedColumns, maxValue } = useMemo(() => {
//     const safeData = Array.isArray(data) ? data : [];

//     const hierarchicalData = {};
//     safeData.forEach(item => {
//       const finishing = item.finishing || 'Unknown';
//       const developer = item.developer || 'Unknown';
//       const project = item.project || 'Unknown';
//       const payment = item.payment || 'Unknown';

//       hierarchicalData[finishing] ??= {};
//       hierarchicalData[finishing][developer] ??= {};
//       hierarchicalData[finishing][developer][project] ??= [];

//       hierarchicalData[finishing][developer][project].push({
//         payment,
//         max: Number(item.max) || 0,
//         avg: Number(item.avg) || 0,
//         min: Number(item.min) || 0,
//         fullData: item
//       });
//     });

//     const finishingSpansLocal = [];
//     const flattenedColumnsLocal = [];

//     Object.keys(hierarchicalData).forEach(finishing => {
//       let finishingColCount = 0;
//       const developerSpans = [];

//       Object.keys(hierarchicalData[finishing]).forEach(developer => {
//         let developerColCount = 0;
//         const projectSpans = [];

//         Object.keys(hierarchicalData[finishing][developer]).forEach(project => {
//           const payments = hierarchicalData[finishing][developer][project];

//           payments.forEach(paymentData => {
//             flattenedColumnsLocal.push({
//               finishing,
//               developer,
//               project,
//               payment: paymentData.payment,
//               max: paymentData.max,
//               avg: paymentData.avg,
//               min: paymentData.min,
//               fullData: paymentData.fullData
//             });
//             developerColCount++;
//             finishingColCount++;
//           });

//           projectSpans.push({ label: project, span: payments.length });
//         });

//         developerSpans.push({ label: developer, span: developerColCount, projects: projectSpans });
//       });

//       finishingSpansLocal.push({ label: finishing, span: finishingColCount, developers: developerSpans });
//     });

//     const allValues = flattenedColumnsLocal.flatMap(c => [c.max, c.avg, c.min]);
//     const maxValueLocal = Math.max(1, ...allValues);

//     return { finishingSpans: finishingSpansLocal, flattenedColumns: flattenedColumnsLocal, maxValue: maxValueLocal };
//   }, [data]);

//   if (!data || data.length === 0) {
//     return (
//       <div className="chart-section">
//         <div className="chart-header">
//           <h3 className="chart-title">{title}</h3>
//           {filterInfo && <div className="chart-filters-info">{filterInfo}</div>}
//         </div>
//         <div className="empty-state">
//           <div className="empty-state-icon">📊</div>
//           <div className="empty-state-text">No data available for the selected filters</div>
//         </div>
//       </div>
//     );
//   }

//   // Layout constants (match CSS)
//   const STACK_HEIGHT = 320;
//   const RECT_H = 36;
//   const RECT_HALF = RECT_H / 2;
//   const TOP_PAD = 8;
//   const BOTTOM_PAD = 8;

//   const yFromValue = (value) => {
//     const pct = clamp(value / maxValue, 0, 1);
//     const usable = STACK_HEIGHT - TOP_PAD - BOTTOM_PAD;
//     return TOP_PAD + (1 - pct) * usable;
//   };

//   // ✅ Make the scroll area wide enough so grid-lines never "end early"
//   const columnPitch = 180; // distance per column
//   const dynamicMinWidth = Math.max(900, flattenedColumns.length * columnPitch);

//   return (
//     <div className="chart-section">
//       <div className="chart-header">
//         <h3 className="chart-title">{title}</h3>
//         {filterInfo && <div className="chart-filters-info">{filterInfo}</div>}
//       </div>

//       <div className="chart-content">
//         {/* X-axis Table */}
//         <div className="chart-table-wrapper">
//           <table className="chart-x-axis-table">
//             <thead>
//               <tr className="hierarchy-level-1">
//                 <th className="fixed-label-column">Finishing</th>
//                 {finishingSpans.map((finishing, idx) => (
//                   <th key={`finishing-${idx}`} colSpan={finishing.span}>{finishing.label}</th>
//                 ))}
//               </tr>

//               <tr className="hierarchy-level-2">
//                 <th className="fixed-label-column">Developer</th>
//                 {finishingSpans.map((finishing, fIdx) =>
//                   finishing.developers.map((developer, dIdx) => (
//                     <th key={`dev-${fIdx}-${dIdx}`} colSpan={developer.span}>{developer.label}</th>
//                   ))
//                 )}
//               </tr>

//               <tr className="hierarchy-level-3">
//                 <th className="fixed-label-column">Project</th>
//                 {finishingSpans.map((finishing, fIdx) =>
//                   finishing.developers.map((developer, dIdx) =>
//                     developer.projects.map((project, pIdx) => (
//                       <th key={`proj-${fIdx}-${dIdx}-${pIdx}`} colSpan={project.span}>{project.label}</th>
//                     ))
//                   )
//                 )}
//               </tr>

//               <tr className="hierarchy-level-4">
//                 <th className="fixed-label-column">Payment</th>
//                 {flattenedColumns.map((col, idx) => (
//                   <th key={`payment-${idx}`}>{col.payment}</th>
//                 ))}
//               </tr>
//             </thead>
//           </table>
//         </div>

//         {/* Chart */}
//         <div className="chart-visualization-scroll">
//           <div className="chart-visualization" style={{ minWidth: `${dynamicMinWidth}px` }}>
//             <div className="chart-grid-lines">
//               {[0, 1, 2, 3, 4, 5].map(i => (
//                 <div key={i} className="grid-line" style={{ top: `${i * 20}%` }} />
//               ))}
//             </div>

//             <div className="chart-bars-container">
//               {flattenedColumns.map((item, index) => {
//                 const yMax = yFromValue(item.max);
//                 const yAvg = yFromValue(item.avg);
//                 const yMin = yFromValue(item.min);

//                 const topCenter = Math.min(yMax, yAvg, yMin) + RECT_HALF;
//                 const bottomCenter = Math.max(yMax, yAvg, yMin) + RECT_HALF;

//                 return (
//                   <div key={index} className="chart-bar-column">
//                     <div className="chart-stack" style={{ height: `${STACK_HEIGHT}px` }}>
//                       <div
//                         className="value-connector"
//                         style={{
//                           top: `${topCenter}px`,
//                           height: `${Math.max(0, bottomCenter - topCenter)}px`
//                         }}
//                       />

//                       {/* Max */}
//                       <div
//                         className="chart-rectangle max"
//                         style={{ top: `${yMax}px` }}
//                         onMouseEnter={(e) => handleHoverAny(e, item)}
//                         onMouseLeave={handleLeave}
//                       >
//                         {valueFormatter(item.max)}
//                       </div>

//                       {/* Avg */}
//                       <div
//                         className="chart-rectangle avg"
//                         style={{ top: `${yAvg}px` }}
//                         onMouseEnter={(e) => handleHoverAny(e, item)}
//                         onMouseLeave={handleLeave}
//                       >
//                         {valueFormatter(item.avg)}
//                       </div>

//                       {/* Min */}
//                       <div
//                         className="chart-rectangle min"
//                         style={{ top: `${yMin}px` }}
//                         onMouseEnter={(e) => handleHoverAny(e, item)}
//                         onMouseLeave={handleLeave}
//                       >
//                         {valueFormatter(item.min)}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ✅ One tooltip showing EVERYTHING */}
//       {tooltip && (
//         <div className="tooltip" style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}>
//           <div className="tooltip-title">Details</div>

//           <div className="tooltip-item"><span className="tooltip-label">Location:</span> {tooltip.data.location}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Asset Type:</span> {tooltip.data.assetType}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Unit Type:</span> {tooltip.data.unitType}</div>

//           <div className="tooltip-item"><span className="tooltip-label">Finishing:</span> {tooltip.data.finishing}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Developer:</span> {tooltip.data.developer}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Project:</span> {tooltip.data.project}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Payment:</span> {tooltip.data.payment}</div>

//           <div className="tooltip-item"><span className="tooltip-label">Min:</span> {valueFormatter(tooltip.data.min)}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Avg:</span> {valueFormatter(tooltip.data.avg)}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Max:</span> {valueFormatter(tooltip.data.max)}</div>
//         </div>
//       )}
//     </div>
//   );
// };
// export default Chart;




// import React, { useMemo, useState } from 'react';

// const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// const Chart = ({ title, data, filterInfo, valueFormatter, selectedFilters }) => {
//   const [tooltip, setTooltip] = useState(null);

//   const { finishingSpans, flattenedColumns, maxValue } = useMemo(() => {
//     const safeData = Array.isArray(data) ? data : [];

//     const hierarchicalData = {};
//     safeData.forEach(item => {
//       const finishing = item.finishing || 'Unknown';
//       const developer = item.developer || 'Unknown';
//       const project = item.project || 'Unknown';
//       const payment = item.payment || 'Unknown';

//       hierarchicalData[finishing] ??= {};
//       hierarchicalData[finishing][developer] ??= {};
//       hierarchicalData[finishing][developer][project] ??= [];

//       hierarchicalData[finishing][developer][project].push({
//         payment,
//         max: Number(item.max) || 0,
//         avg: Number(item.avg) || 0,
//         min: Number(item.min) || 0,
//         fullData: item
//       });
//     });

//     const finishingSpansLocal = [];
//     const flattenedColumnsLocal = [];

//     Object.keys(hierarchicalData).forEach(finishing => {
//       let finishingColCount = 0;
//       const developerSpans = [];

//       Object.keys(hierarchicalData[finishing]).forEach(developer => {
//         let developerColCount = 0;
//         const projectSpans = [];

//         Object.keys(hierarchicalData[finishing][developer]).forEach(project => {
//           const payments = hierarchicalData[finishing][developer][project];

//           payments.forEach(paymentData => {
//             flattenedColumnsLocal.push({
//               finishing,
//               developer,
//               project,
//               payment: paymentData.payment,
//               max: paymentData.max,
//               avg: paymentData.avg,
//               min: paymentData.min,
//               fullData: paymentData.fullData
//             });
//             developerColCount++;
//             finishingColCount++;
//           });

//           projectSpans.push({ label: project, span: payments.length });
//         });

//         developerSpans.push({ label: developer, span: developerColCount, projects: projectSpans });
//       });

//       finishingSpansLocal.push({ label: finishing, span: finishingColCount, developers: developerSpans });
//     });

//     const allValues = flattenedColumnsLocal.flatMap(c => [c.max, c.avg, c.min]);
//     const maxValueLocal = Math.max(1, ...allValues);

//     return { finishingSpans: finishingSpansLocal, flattenedColumns: flattenedColumnsLocal, maxValue: maxValueLocal };
//   }, [data]);

//   const TOOLTIP_W = 320;
//   const TOOLTIP_H = 280;
//   const PAD = 12;

//   const setTooltipSmart = (event, item) => {
//     const location =
//       selectedFilters?.location?.length ? selectedFilters.location.join(', ')
//       : item.fullData?.Location || item.fullData?.location || '—';

//     const assetType =
//       selectedFilters?.assetType?.length ? selectedFilters.assetType.join(', ')
//       : item.fullData?.['Asset Type'] || item.fullData?.assetType || '—';

//     const unitType =
//       selectedFilters?.unitType?.length ? selectedFilters.unitType.join(', ')
//       : item.fullData?.['Unit Type'] || item.fullData?.unitType || '—';

//     let x = event.clientX + 14;
//     let y = event.clientY + 14;

//     const vw = window.innerWidth;
//     const vh = window.innerHeight;

//     if (x + TOOLTIP_W + PAD > vw) x = vw - TOOLTIP_W - PAD;
//     if (y + TOOLTIP_H + PAD > vh) y = vh - TOOLTIP_H - PAD;
//     if (x < PAD) x = PAD;
//     if (y < PAD) y = PAD;

//     setTooltip({
//       x,
//       y,
//       data: {
//         finishing: item.finishing,
//         developer: item.developer,
//         project: item.project,
//         payment: item.payment,
//         min: item.min,
//         avg: item.avg,
//         max: item.max,
//         location,
//         assetType,
//         unitType
//       }
//     });
//   };

//   const handleHoverEnter = (e, item) => setTooltipSmart(e, item);
//   const handleHoverMove = (e, item) => setTooltipSmart(e, item);
//   const handleHoverLeave = () => setTooltip(null);

//   if (!data || data.length === 0) {
//     return (
//       <div className="chart-section">
//         <div className="chart-header">
//           <h3 className="chart-title">{title}</h3>
//           {filterInfo && <div className="chart-filters-info">{filterInfo}</div>}
//         </div>
//         <div className="empty-state">
//           <div className="empty-state-icon">📊</div>
//           <div className="empty-state-text">No data available for the selected filters</div>
//         </div>
//       </div>
//     );
//   }

//   const STACK_HEIGHT = 320;
//   const RECT_H = 36;
//   const RECT_HALF = RECT_H / 2;
//   const TOP_PAD = 8;
//   const BOTTOM_PAD = 8;

//   const yFromValue = (value) => {
//     const pct = clamp(value / maxValue, 0, 1);
//     const usable = STACK_HEIGHT - TOP_PAD - BOTTOM_PAD;
//     return TOP_PAD + (1 - pct) * usable;
//   };

//   // keep grid lines visible across scroll width
//   const columnPitch = 180;
//   const dynamicMinWidth = Math.max(900, flattenedColumns.length * columnPitch);

//   return (
//     <div className="chart-section">
//       <div className="chart-header">
//         <h3 className="chart-title">{title}</h3>
//         {filterInfo && <div className="chart-filters-info">{filterInfo}</div>}
//       </div>

//       <div className="chart-content">
//         <div className="chart-table-wrapper">
//           <table className="chart-x-axis-table">
//             <thead>
//               <tr className="hierarchy-level-1">
//                 <th className="fixed-label-column">Finishing</th>
//                 {finishingSpans.map((finishing, idx) => (
//                   <th key={`finishing-${idx}`} colSpan={finishing.span}>{finishing.label}</th>
//                 ))}
//               </tr>

//               <tr className="hierarchy-level-2">
//                 <th className="fixed-label-column">Developer</th>
//                 {finishingSpans.map((finishing, fIdx) =>
//                   finishing.developers.map((developer, dIdx) => (
//                     <th key={`dev-${fIdx}-${dIdx}`} colSpan={developer.span}>{developer.label}</th>
//                   ))
//                 )}
//               </tr>

//               <tr className="hierarchy-level-3">
//                 <th className="fixed-label-column">Project</th>
//                 {finishingSpans.map((finishing, fIdx) =>
//                   finishing.developers.map((developer, dIdx) =>
//                     developer.projects.map((project, pIdx) => (
//                       <th key={`proj-${fIdx}-${dIdx}-${pIdx}`} colSpan={project.span}>{project.label}</th>
//                     ))
//                   )
//                 )}
//               </tr>

//               <tr className="hierarchy-level-4">
//                 <th className="fixed-label-column">Payment</th>
//                 {flattenedColumns.map((col, idx) => (
//                   <th key={`payment-${idx}`}>{col.payment}</th>
//                 ))}
//               </tr>
//             </thead>
//           </table>
//         </div>

//         <div className="chart-visualization-scroll">
//           <div className="chart-visualization" style={{ minWidth: `${dynamicMinWidth}px` }}>
//             <div className="chart-grid-lines">
//               {[0, 1, 2, 3, 4, 5].map(i => (
//                 <div key={i} className="grid-line" style={{ top: `${i * 20}%` }} />
//               ))}
//             </div>

//             <div className="chart-bars-container">
//               {flattenedColumns.map((item, index) => {
//                 const yMax = yFromValue(item.max);
//                 const yAvg = yFromValue(item.avg);
//                 const yMin = yFromValue(item.min);

//                 const topCenter = Math.min(yMax, yAvg, yMin) + RECT_HALF;
//                 const bottomCenter = Math.max(yMax, yAvg, yMin) + RECT_HALF;

//                 return (
//                   <div key={index} className="chart-bar-column">
//                     <div className="chart-stack" style={{ height: `${STACK_HEIGHT}px` }}>
//                       <div
//                         className="value-connector"
//                         style={{ top: `${topCenter}px`, height: `${Math.max(0, bottomCenter - topCenter)}px` }}
//                         onMouseEnter={(e) => handleHoverEnter(e, item)}
//                         onMouseMove={(e) => handleHoverMove(e, item)}
//                         onMouseLeave={handleHoverLeave}
//                       />

//                       <div
//                         className="chart-rectangle max"
//                         style={{ top: `${yMax}px` }}
//                         onMouseEnter={(e) => handleHoverEnter(e, item)}
//                         onMouseMove={(e) => handleHoverMove(e, item)}
//                         onMouseLeave={handleHoverLeave}
//                       >
//                         {valueFormatter(item.max)}
//                       </div>

//                       <div
//                         className="chart-rectangle avg"
//                         style={{ top: `${yAvg}px` }}
//                         onMouseEnter={(e) => handleHoverEnter(e, item)}
//                         onMouseMove={(e) => handleHoverMove(e, item)}
//                         onMouseLeave={handleHoverLeave}
//                       >
//                         {valueFormatter(item.avg)}
//                       </div>

//                       <div
//                         className="chart-rectangle min"
//                         style={{ top: `${yMin}px` }}
//                         onMouseEnter={(e) => handleHoverEnter(e, item)}
//                         onMouseMove={(e) => handleHoverMove(e, item)}
//                         onMouseLeave={handleHoverLeave}
//                       >
//                         {valueFormatter(item.min)}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>

//       {tooltip && (
//         <div className="tooltip" style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}>
//           <div className="tooltip-title">Details</div>

//           <div className="tooltip-item"><span className="tooltip-label">Min:</span> {valueFormatter(tooltip.data.min)}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Avg:</span> {valueFormatter(tooltip.data.avg)}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Max:</span> {valueFormatter(tooltip.data.max)}</div>

//           <div className="tooltip-item"><span className="tooltip-label">Finishing:</span> {tooltip.data.finishing}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Developer:</span> {tooltip.data.developer}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Project:</span> {tooltip.data.project}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Payment:</span> {tooltip.data.payment}</div>

//           <div className="tooltip-item"><span className="tooltip-label">Location:</span> {tooltip.data.location}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Asset Type:</span> {tooltip.data.assetType}</div>
//           <div className="tooltip-item"><span className="tooltip-label">Unit Type:</span> {tooltip.data.unitType}</div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Chart;

import React, { useMemo, useState, useRef, useEffect } from 'react';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const Chart = ({ title, data, filterInfo, valueFormatter, selectedFilters }) => {
  const [tooltip, setTooltip] = useState(null);
  const containerScrollRef = useRef(null);
  const tableRef = useRef(null);
  const chartRef = useRef(null);

  // Synchronized scrolling - one scrollbar controls both
  useEffect(() => {
    const containerScroll = containerScrollRef.current;
    const table = tableRef.current;
    const chart = chartRef.current;

    if (!containerScroll || !table || !chart) return;

    const syncScroll = () => {
      const scrollLeft = containerScroll.scrollLeft;
      if (table) table.scrollLeft = scrollLeft;
      if (chart) chart.scrollLeft = scrollLeft;
    };

    containerScroll.addEventListener('scroll', syncScroll);

    return () => {
      containerScroll.removeEventListener('scroll', syncScroll);
    };
  }, []);

  const { finishingSpans, flattenedColumns, maxValue } = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];

    const hierarchicalData = {};
    safeData.forEach(item => {
      const finishing = item.finishing || 'Unknown';
      const developer = item.developer || 'Unknown';
      const project = item.project || 'Unknown';
      const payment = item.payment || 'Unknown';

      hierarchicalData[finishing] ??= {};
      hierarchicalData[finishing][developer] ??= {};
      hierarchicalData[finishing][developer][project] ??= [];

      hierarchicalData[finishing][developer][project].push({
        payment,
        max: Number(item.max) || 0,
        avg: Number(item.avg) || 0,
        min: Number(item.min) || 0,
        fullData: item
      });
    });

    const finishingSpansLocal = [];
    const flattenedColumnsLocal = [];

    Object.keys(hierarchicalData).forEach(finishing => {
      let finishingColCount = 0;
      const developerSpans = [];

      Object.keys(hierarchicalData[finishing]).forEach(developer => {
        let developerColCount = 0;
        const projectSpans = [];

        Object.keys(hierarchicalData[finishing][developer]).forEach(project => {
          const payments = hierarchicalData[finishing][developer][project];

          payments.forEach(paymentData => {
            flattenedColumnsLocal.push({
              finishing,
              developer,
              project,
              payment: paymentData.payment,
              max: paymentData.max,
              avg: paymentData.avg,
              min: paymentData.min,
              fullData: paymentData.fullData
            });
            developerColCount++;
            finishingColCount++;
          });

          projectSpans.push({ label: project, span: payments.length });
        });

        developerSpans.push({ label: developer, span: developerColCount, projects: projectSpans });
      });

      finishingSpansLocal.push({ label: finishing, span: finishingColCount, developers: developerSpans });
    });

    const allValues = flattenedColumnsLocal.flatMap(c => [c.max, c.avg, c.min]);
    const maxValueLocal = Math.max(1, ...allValues);

    return { finishingSpans: finishingSpansLocal, flattenedColumns: flattenedColumnsLocal, maxValue: maxValueLocal };
  }, [data]);

  const TOOLTIP_W = 320;
  const TOOLTIP_H = 280;
  const PAD = 12;

  const setTooltipSmart = (event, item) => {
    // Use the specific location(s) from this data point, not the filter
    const location = item.fullData?.locations || item.fullData?.Location || item.fullData?.location || '—';
    
    // For asset type and unit type, still use filters if selected, otherwise show from data
    const assetType =
      selectedFilters?.assetType?.length ? selectedFilters.assetType.join(', ')
      : item.fullData?.['Asset Type'] || item.fullData?.assetType || '—';

    const unitType =
      selectedFilters?.unitType?.length ? selectedFilters.unitType.join(', ')
      : item.fullData?.['Unit Type'] || item.fullData?.unitType || '—';

    let x = event.clientX + 14;
    let y = event.clientY + 14;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (x + TOOLTIP_W + PAD > vw) x = vw - TOOLTIP_W - PAD;
    if (y + TOOLTIP_H + PAD > vh) y = vh - TOOLTIP_H - PAD;
    if (x < PAD) x = PAD;
    if (y < PAD) y = PAD;

    setTooltip({
      x,
      y,
      data: {
        finishing: item.finishing,
        developer: item.developer,
        project: item.project,
        payment: item.payment,
        min: item.min,
        avg: item.avg,
        max: item.max,
        location,
        assetType,
        unitType
      }
    });
  };

  const handleHoverEnter = (e, item) => setTooltipSmart(e, item);
  const handleHoverMove = (e, item) => setTooltipSmart(e, item);
  const handleHoverLeave = () => setTooltip(null);

  if (!data || data.length === 0) {
    return (
      <div className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">{title}</h3>
          {filterInfo && <div className="chart-filters-info">{filterInfo}</div>}
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">No data available for the selected filters</div>
        </div>
      </div>
    );
  }

  const STACK_HEIGHT = 320;
  const RECT_H = 36;
  const RECT_HALF = RECT_H / 2;
  const TOP_PAD = 8;
  const BOTTOM_PAD = 8;

  const yFromValue = (value) => {
    const pct = clamp(value / maxValue, 0, 1);
    const usable = STACK_HEIGHT - TOP_PAD - BOTTOM_PAD;
    return TOP_PAD + (1 - pct) * usable;
  };

  // CRITICAL: Column width calculation
  const LABEL_COLUMN_WIDTH = 120; // Fixed width for label column - NEVER CHANGES
  const MIN_TOTAL_WIDTH = 1200; // Minimum total width for the entire container
  const BASE_COLUMN_WIDTH = 140; // Reduced from 180px to 140px for tighter fit
  
  const columnCount = flattenedColumns.length;
  
  // Calculate available space for data columns
  const availableSpaceForColumns = MIN_TOTAL_WIDTH - LABEL_COLUMN_WIDTH;
  
  // If we have few columns, expand them to fill the space
  // Otherwise use the base width and allow horizontal scroll
  let COLUMN_WIDTH;
  let totalWidth;
  
  if (columnCount * BASE_COLUMN_WIDTH < availableSpaceForColumns) {
    // Few columns: distribute the available space equally
    COLUMN_WIDTH = Math.floor(availableSpaceForColumns / columnCount);
    totalWidth = MIN_TOTAL_WIDTH;
  } else {
    // Many columns: use base width and enable scrolling
    COLUMN_WIDTH = BASE_COLUMN_WIDTH;
    totalWidth = LABEL_COLUMN_WIDTH + (columnCount * COLUMN_WIDTH);
  }

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {filterInfo && <div className="chart-filters-info">{filterInfo}</div>}
      </div>

      <div className="chart-content">
        {/* Container with single scrollbar */}
        <div className="chart-scroll-container" ref={containerScrollRef}>
          <div className="chart-scroll-content" style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}>
            
            {/* X-AXIS TABLE - no scrollbar */}
            <div className="chart-table-wrapper-inner" ref={tableRef}>
              <div style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}>
                <table className="chart-x-axis-table">
                  <colgroup>
                    <col style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }} />
                    {flattenedColumns.map((_, idx) => (
                      <col key={`col-${idx}`} style={{ width: `${COLUMN_WIDTH}px`, minWidth: `${COLUMN_WIDTH}px`, maxWidth: `${COLUMN_WIDTH}px` }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="hierarchy-level-1">
                      <th className="fixed-label-column">Finishing</th>
                      {finishingSpans.map((finishing, idx) => (
                        <th 
                          key={`finishing-${idx}`} 
                          colSpan={finishing.span}
                        >
                          {finishing.label}
                        </th>
                      ))}
                    </tr>

                    <tr className="hierarchy-level-2">
                      <th className="fixed-label-column">Developer</th>
                      {finishingSpans.map((finishing, fIdx) =>
                        finishing.developers.map((developer, dIdx) => (
                          <th 
                            key={`dev-${fIdx}-${dIdx}`} 
                            colSpan={developer.span}
                          >
                            {developer.label}
                          </th>
                        ))
                      )}
                    </tr>

                    <tr className="hierarchy-level-3">
                      <th className="fixed-label-column">Project</th>
                      {finishingSpans.map((finishing, fIdx) =>
                        finishing.developers.map((developer, dIdx) =>
                          developer.projects.map((project, pIdx) => (
                            <th 
                              key={`proj-${fIdx}-${dIdx}-${pIdx}`} 
                              colSpan={project.span}
                            >
                              {project.label}
                            </th>
                          ))
                        )
                      )}
                    </tr>

                    <tr className="hierarchy-level-4">
                      <th className="fixed-label-column">Payment</th>
                      {flattenedColumns.map((col, idx) => (
                        <th 
                          key={`payment-${idx}`}
                        >
                          {col.payment}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div>
            </div>

            {/* CHART VISUALIZATION - no scrollbar */}
            <div className="chart-visualization-wrapper-inner" ref={chartRef}>
              <div className="chart-visualization" style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}>
                
                {/* Grid lines - positioned absolutely across entire width */}
                <div className="chart-grid-lines" style={{ position: 'absolute', top: '40px', left: '120px', right: 0, bottom: '40px' }}>
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="grid-line" style={{ top: `${i * 20}%` }} />
                  ))}
                </div>

                {/* Bars Container - uses same structure as table */}
                <div style={{ display: 'flex', width: '100%', paddingTop: '40px', paddingBottom: '40px' }}>
                  {/* Empty space for label column */}
                  <div style={{ width: '120px', minWidth: '120px', maxWidth: '120px', flexShrink: 0 }}></div>
                  
                  {/* Bar columns - each matches table column width exactly */}
                  {flattenedColumns.map((item, index) => {
                    const yMax = yFromValue(item.max);
                    const yAvg = yFromValue(item.avg);
                    const yMin = yFromValue(item.min);

                    const topCenter = Math.min(yMax, yAvg, yMin) + RECT_HALF;
                    const bottomCenter = Math.max(yMax, yAvg, yMin) + RECT_HALF;

                    return (
                      <div 
                        key={index} 
                        className="chart-bar-column"
                        style={{ 
                          width: `${COLUMN_WIDTH}px`, 
                          minWidth: `${COLUMN_WIDTH}px`, 
                          maxWidth: `${COLUMN_WIDTH}px`,
                          flexShrink: 0,
                          position: 'relative'
                        }}
                      >
                        <div className="chart-stack" style={{ height: `${STACK_HEIGHT}px`, position: 'relative' }}>
                          <div
                            className="value-connector"
                            style={{ top: `${topCenter}px`, height: `${Math.max(0, bottomCenter - topCenter)}px` }}
                            onMouseEnter={(e) => handleHoverEnter(e, item)}
                            onMouseMove={(e) => handleHoverMove(e, item)}
                            onMouseLeave={handleHoverLeave}
                          />

                          <div
                            className="chart-rectangle max"
                            style={{ top: `${yMax}px` }}
                            onMouseEnter={(e) => handleHoverEnter(e, item)}
                            onMouseMove={(e) => handleHoverMove(e, item)}
                            onMouseLeave={handleHoverLeave}
                          >
                            {valueFormatter(item.max)}
                          </div>

                          <div
                            className="chart-rectangle avg"
                            style={{ top: `${yAvg}px` }}
                            onMouseEnter={(e) => handleHoverEnter(e, item)}
                            onMouseMove={(e) => handleHoverMove(e, item)}
                            onMouseLeave={handleHoverLeave}
                          >
                            {valueFormatter(item.avg)}
                          </div>

                          <div
                            className="chart-rectangle min"
                            style={{ top: `${yMin}px` }}
                            onMouseEnter={(e) => handleHoverEnter(e, item)}
                            onMouseMove={(e) => handleHoverMove(e, item)}
                            onMouseLeave={handleHoverLeave}
                          >
                            {valueFormatter(item.min)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {tooltip && (
        <div className="tooltip" style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}>
          <div className="tooltip-title">Details</div>

          <div className="tooltip-item"><span className="tooltip-label">Min:</span> {valueFormatter(tooltip.data.min)}</div>
          <div className="tooltip-item"><span className="tooltip-label">Avg:</span> {valueFormatter(tooltip.data.avg)}</div>
          <div className="tooltip-item"><span className="tooltip-label">Max:</span> {valueFormatter(tooltip.data.max)}</div>

          <div className="tooltip-item"><span className="tooltip-label">Finishing:</span> {tooltip.data.finishing}</div>
          <div className="tooltip-item"><span className="tooltip-label">Developer:</span> {tooltip.data.developer}</div>
          <div className="tooltip-item"><span className="tooltip-label">Project:</span> {tooltip.data.project}</div>
          <div className="tooltip-item"><span className="tooltip-label">Payment:</span> {tooltip.data.payment}</div>

          <div className="tooltip-item"><span className="tooltip-label">Location:</span> {tooltip.data.location}</div>
          <div className="tooltip-item"><span className="tooltip-label">Asset Type:</span> {tooltip.data.assetType}</div>
          <div className="tooltip-item"><span className="tooltip-label">Unit Type:</span> {tooltip.data.unitType}</div>
        </div>
      )}
    </div>
  );
};

export default Chart;