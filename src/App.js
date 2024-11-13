import React, {useState, useEffect, useRef} from 'react';
import backgroundImage from './image.jpeg';

const Canvas = () => {
    const canvasRef = useRef(null);
    const [gridSize, setGridSize] = useState(20);
    const [algorithm, setAlgorithm] = useState('bresenhamLine');
    const [lineStart, setLineStart] = useState({x: 2, y: 2});
    const [lineEnd, setLineEnd] = useState({x: 8, y: 5});
    const [circleCenter, setCircleCenter] = useState({x: 10, y: 10});
    const [circleRadius, setCircleRadius] = useState(5);
    const [drawTime, setDrawTime] = useState(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const redraw = () => {
            canvas.width = 400 * scale;
            canvas.height = 400 * scale;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);

            drawGrid(ctx, canvas.width / scale, canvas.height / scale, gridSize);
            let startTime;
            if ((algorithm === 'bresenhamLine' || algorithm === 'ddaLine' || algorithm === 'simpleLine') && lineStart && lineEnd) {
                startTime = performance.now();
                if (algorithm === 'bresenhamLine') {
                    drawBresenhamLine(ctx, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y, gridSize);
                } else if (algorithm === 'ddaLine') {
                    drawDDALine(ctx, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y, gridSize);
                } else {
                    drawSimpleLine(ctx, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y, gridSize);

                }
            } else if ((algorithm === 'bresenhamCircle') && circleCenter && circleRadius !== null) {
                startTime = performance.now();
                if (algorithm === 'bresenhamCircle') {
                    drawBresenhamCircle(ctx, circleCenter.x, circleCenter.y, circleRadius, gridSize);
                } else {
                    drawMidpointCircle(ctx, circleCenter.x, circleCenter.y, circleRadius, gridSize);
                }
            }
            if (startTime) {
                const endTime = performance.now();
                setDrawTime(endTime - startTime);
            }
        };
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        redraw();
    }, [gridSize, algorithm, lineStart, lineEnd, circleCenter, circleRadius, scale]);


    const getGridCoordinates = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left - 1) / (gridSize * scale));
        const y = Math.floor((event.clientY - rect.top - 1) / (gridSize * scale));
        return {x, y};

    };

    const handleScaleCahnge = (event) => {
        setScale(parseFloat(event.target.value));
    }

    const handleCanvasClick = (event) => {
        const coords = getGridCoordinates(event);


        if (algorithm === 'bresenhamLine' || algorithm === 'ddaLine' || algorithm === 'simpleLine') {
            if (!lineStart) {
                setLineStart(coords);
            } else if (!lineEnd) {
                setLineEnd(coords);
            } else {
                setLineStart(coords);
                setLineEnd(null);
            }
        } else if (algorithm === 'bresenhamCircle') {
            setCircleCenter(coords);
            const radius = parseInt(prompt("Enter the radius:", "5"), 10) || 5;
            setCircleRadius(radius);
            setLineStart(null);
            setLineEnd(null);
        }
    };

    const drawGrid = (ctx, width, height, gridSize) => {
        ctx.strokeStyle = 'lightgray';
        ctx.lineWidth = 0.5 / scale;

        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();

            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.font = `${10 / scale}px Arial`;
            ctx.fillText(x / 20, x, 12 / scale);

        }

        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();

            ctx.fillStyle = 'black';
            ctx.textAlign = 'right';
            ctx.font = `${10 / scale}px Arial`;
            ctx.fillText(y, -2 / scale, y + 4 / scale);

        }
        if (lineStart) {
            ctx.fillStyle = 'green';
            fillRect(ctx, lineStart.x, lineStart.y, gridSize);
        }

        if (lineEnd) {
            ctx.fillStyle = 'red';
            fillRect(ctx, lineEnd.x, lineEnd.y, gridSize);
        }

        if ((algorithm === 'bresenhamCircle') && circleCenter) {
            ctx.fillStyle = 'blue';
            fillRect(ctx, circleCenter.x, circleCenter.y, gridSize);
        }

    };

    const drawSimpleLine = (ctx, x0, y0, x1, y1, gridSize) => {
        ctx.fillStyle = 'black';
        const dx = x1 - x0;
        const dy = y1 - y0;

        if (Math.abs(dx) > Math.abs(dy)) {
            const m = dy / dx;

            if (x0 < x1) {
                for (let x = x0; x <= x1; x++) {
                    let y = Math.round(y0 + m * (x - x0));
                    fillRect(ctx, x, y, gridSize);
                }
            } else {
                for (let x = x0; x >= x1; x--) {
                    let y = Math.round(y0 + m * (x - x0));
                    fillRect(ctx, x, y, gridSize);
                }
            }

        } else {
            const m = dx / dy;
            if (y0 < y1) {
                for (let y = y0; y <= y1; y++) {
                    let x = Math.round(x0 + m * (y - y0));
                    fillRect(ctx, x, y, gridSize);
                }
            } else {
                for (let y = y0; y >= y1; y--) {
                    let x = Math.round(x0 + m * (y - y0));
                    fillRect(ctx, x, y, gridSize);
                }
            }
        }
    };
    const drawBresenhamLine = (ctx, x0, y0, x1, y1, gridSize) => {
        ctx.fillStyle = 'black';
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = x0 < x1 ? 1 : -1;
        let sy = y0 < y1 ? 1 : -1;
        let err = (dx > dy ? dx : -dy) / 2;

        while (true) {
            fillRect(ctx, x0, y0, gridSize);
            if (x0 === x1 && y0 === y1) break;

            let e2 = err;
            if (e2 > -dx) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dy) {
                err += dx;
                y0 += sy;
            }
        }
    };

    const drawDDALine = (ctx, x0, y0, x1, y1, gridSize) => {
        ctx.fillStyle = 'black';
        const dx = x1 - x0;
        const dy = y1 - y0;
        const steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
        const xIncrement = dx / steps;
        const yIncrement = dy / steps;
        let x = x0;
        let y = y0;

        for (let i = 0; i <= steps; i++) {
            fillRect(ctx, Math.round(x), Math.round(y), gridSize);
            x += xIncrement;
            y += yIncrement;
        }
    };


    const drawBresenhamCircle = (ctx, centerX, centerY, radius, gridSize) => {
        ctx.fillStyle = 'black';
        let x = 0;
        let y = radius;
        let d = 3 - 2 * radius;

        drawCirclePoints(ctx, centerX, centerY, x, y, gridSize);

        while (y >= x) {
            x++;
            if (d > 0) {
                y--;
                d = d + 4 * (x - y) + 10;
            } else {
                d = d + 4 * x + 6;
            }
            drawCirclePoints(ctx, centerX, centerY, x, y, gridSize);
        }
    };

    const drawMidpointCircle = (ctx, centerX, centerY, radius, gridSize) => {
        ctx.fillStyle = 'black';
        let x = 0;
        let y = radius;
        let p = 1 - radius;

        drawCirclePoints(ctx, centerX, centerY, x, y, gridSize);

        while (x < y) {
            x++;
            if (p < 0) {
                p += 2 * x + 1;
            } else {
                y--;
                p += 2 * (x - y) + 1;
            }
            drawCirclePoints(ctx, centerX, centerY, x, y, gridSize);
        }
    };


    const drawCirclePoints = (ctx, centerX, centerY, x, y, gridSize) => {
        fillRect(ctx, centerX + x, centerY + y, gridSize);
        fillRect(ctx, centerX - x, centerY + y, gridSize);
        fillRect(ctx, centerX + x, centerY - y, gridSize);
        fillRect(ctx, centerX - x, centerY - y, gridSize);
        fillRect(ctx, centerX + y, centerY + x, gridSize);
        fillRect(ctx, centerX - y, centerY + x, gridSize);
        fillRect(ctx, centerX + y, centerY - x, gridSize);
        fillRect(ctx, centerX - y, centerY - x, gridSize);
    };

    const fillRect = (ctx, x, y, gridSize) => {
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
    };


    return (
        <div style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}> {}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px'}}> {}
                <label htmlFor="algorithm">Algorithm:</label>
                <select id="algorithm" value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
                    <option value="bresenhamLine">Bresenham Line</option>
                    <option value="ddaLine">DDA Line</option>
                    <option value="simpleLine">Simple Line</option>
                    <option value="bresenhamCircle">Bresenham Circle</option>
                </select>
            </div>

            {(algorithm === 'bresenhamLine' || algorithm === "ddaLine" || algorithm === "simpleLine") && (

                <div>
                    <label>Line Start (x, y):</label>
                    <input type="number" value={lineStart?.x}
                           onChange={e => setLineStart({...lineStart, x: parseInt(e.target.value, 10) || 0})}/>
                    <input type="number" value={lineStart?.y}
                           onChange={e => setLineStart({...lineStart, y: parseInt(e.target.value, 10) || 0})}/>
                    <br/>
                    <label>Line End (x, y):</label>
                    <input type="number" value={lineEnd?.x}
                           onChange={e => setLineEnd({...lineEnd, x: parseInt(e.target.value, 10) || 0})}/>
                    <input type="number" value={lineEnd?.y}
                           onChange={e => setLineEnd({...lineEnd, y: parseInt(e.target.value, 10) || 0})}/>
                </div>
            )}


            {(algorithm === 'bresenhamCircle' || algorithm === 'midpointCircle') && (
                <div>
                    <label>Circle Center (x, y):</label>
                    <input type="number" value={circleCenter.x}
                           onChange={e => setCircleCenter({...circleCenter, x: parseInt(e.target.value, 10) || 0})}/>
                    <input type="number" value={circleCenter.y}
                           onChange={e => setCircleCenter({...circleCenter, y: parseInt(e.target.value, 10) || 0})}/>
                    <br/>
                    <label>Circle Radius:</label>
                    <input type="number" value={circleRadius}
                           onChange={e => setCircleRadius(parseInt(e.target.value, 10) || 0)}/>
                </div>
            )}

            <div>
                <label htmlFor="scale">Scale:</label>
                <input
                    type="range"
                    id="scale"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={scale}
                    onChange={handleScaleCahnge}
                />
                <span>{scale}</span> {}

            </div>
            <div> {}
                <label>Draw Time (ms):</label>
                <input type="text" value={drawTime ? drawTime.toFixed(2) : ''} readOnly/>
            </div>
            <canvas
                ref={canvasRef}
                width={400 * scale}
                height={400 * scale}
                style={{border: '1px solid black'}}
                onClick={handleCanvasClick}
            />
        </div>
    );
};

export default Canvas;