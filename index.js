const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

const w = 1600;
const h = 600;
const widthMap = 2450;
const heightMap = 895;

const margin = {
    top: 36,
    right: 32,
    bottom: 36,
    left: 32
}

axios.get(url).then(response => {
    const data = response.data;

    const genreList = data.children.map(item => {
        return item.name;
    });

    const SVG_HEADER = d3.select('.container')
        .append('svg')
        .attr('id', 'SVGHEADER')
        .attr('viewBox', [0, 0, w, 80]);

    const SVG_TREE_MAP = d3.select('.container')
        .append('svg')
        .attr('id', 'SVGMAP')
        .attr('viewBox', [0, 0, widthMap, heightMap])
        .style('margin-bottom', '2em');

    SVG_HEADER.append('text')
        .attr('x', w / 2)
        .attr('y', margin.top - 9)
        .attr('text-anchor', 'middle')
        .attr('id', 'title')
        .style('font-size', '1.8em')
        .style('font-weight', 'bold')
        .style('letter-spacing', 3)
        .style('font-weight', 300)
        .text('Movie Sales');

    SVG_HEADER.append('text')
        .attr('x', w / 2)
        .attr('y', margin.top + 20)
        .attr('text-anchor', 'middle')
        .attr('id', 'description')
        .style('font-size', '1.2em')
        .style('font-weight', 'bold')
        .style('font-weight', 300)
        .text('Top 100 Highest Grossing Movies Grouped By Genre');
    const color = d3.scaleOrdinal(genreList, d3.schemeCategory10);
    const treemap = treeData => d3.treemap()
        .size([widthMap, heightMap])
        .padding(1)
        .round(false)(d3.hierarchy(treeData).sum(d => d.value).sort((a, b) => b.value - a.value));

    const root = treemap(data);
    const leaf = SVG_TREE_MAP.selectAll('g')
        .data(root.leaves())
        .join('g')
        .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

    const tooltip = document.querySelector('#tooltip');

    leaf.append('rect')
        .attr('id', (d, i) => 'rect' + i)
        .attr('class', 'tile')
        .attr('data-name', d => d.data.name.trim())
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => { return d.data.value; })
        .attr('fill', d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr('fill-opacity', 0.6)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .on('mouseover', (d, i) => {
            const value = d.data.value;
            tooltip.style.visibility = 'visible';
            tooltip.style.left = d3.event.pageX - 115;
            tooltip.style.top = d3.event.pageY - 60;
            tooltip.innerHTML = `Total Grossing: $ ${Number(value).toLocaleString()}`
            tooltip.setAttribute('data-value', Number(value))
        })
        .on('mouseout', (d, i) => {
            tooltip.style.visibility = 'hidden';
            tooltip.style.right = 0;
            tooltip.style.top = 0;
        })
        .on('mousemove', d => {
            tooltip.style.visibility = 'visible';
            tooltip.style.left = d3.event.pageX - 115;
            tooltip.style.top = d3.event.pageY - 60;
        });

    leaf.append('clipPath')
        .attr('id', (d, i) => { console.log('leaf data', d); return 'clipPath' + i })
        .append('use')
        .attr('xlink:href', (d, i) => '#rect' + i);

    leaf.append('text')
        .attr('clip-path', (d, i) => `url(#clipPath${i})`)
        .selectAll('tspan')
        .data(d => {
            return d.data.name.match(/[a-zA-Z]+\s\d+|[a-zA-Z]+\s[a-zA-Z]{1,2 }\b|[a-zA-Z]+/ig).filter(item => Boolean(item));
        })
        .join('tspan')
        .attr('x', 3)
        .attr('y', (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
        .text(d => d);

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function entity(character) {
        return `&#${character.charCodeAt(0).toString()};`;
    }

    function swatches({
        color,
        columns = null,
        format = x => x,
        swatchSize = 20,
        swatchWidth = swatchSize,
        swatchHeight = swatchSize,
        marginLeft = 0
    }) {
        const id = 'category' + Math.floor(Math.random() * (10000000 - 1 + 1)) + 1;
        if (columns !== null) {
            return `<div  id='legend' style="display: flex; align-items: center; justify-content: center; margin-left: ${+marginLeft}px; min-height: 33px; font: 10px sans-serif;">
        <style>
            .${id}-item {
                break-inside: avoid;
                display: flex;
                align-items: center;
                padding-bottom: 1px;
            }

            .${id}-label {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: calc(100% - ${+swatchWidth}px - 0.5em);
            }

            .${id}-swatch {
                width: ${+swatchWidth}px;
                height: ${+swatchHeight}px;
                margin: 0 0.5em 0 0;
            }
        </style>
        <div style="width: 100%; columns: ${columns};">${color.domain().map(value => {
                const label = format(value);
                return `<div class="${id}-item">
            <div class="${id}-swatch" style="background:${color(value)};"></div>
            <div class="${id}-label" title="${label.replace(/["&]/g, entity)}">${document.createTextNode(label)}</div>
            </div>`;
            })}
        </div>
        </div>`} else {
            return `<div id='legend' style="display: flex; align-items: center; justify-content: center; min-height: 33px; margin-left: ${+marginLeft}px; font: 10px sans-serif;">
        <style>

        </style>
        <svg width="100%" height="80">
        ${color.domain().map((value, i) => `
        <g transform='translate(${80 * i}, ${10})'>
            <rect class='legend-item' x='${0}' y='20' height='10' width='10'  class="${id}" fill="${color(value)}"></rect>
            <text x='${15}' y='28.5'>${(format(value))}</text>
        </g>
        `)}
        </svg>`;
        }
    }

    document.querySelector('.container')
        .insertAdjacentHTML('beforeend',
            swatches({ color: color }));

});