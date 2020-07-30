const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

const w = 1600;
const h = 600;
const widthMap = 1950;
const heightMap = 795;

const margin = {
    top: 36,
    right: 32,
    bottom: 36,
    left: 32
}

axios.get(url).then(response => {
    const data = response.data;
    console.log(data);

    const genreList = data.children.map(item => item.name);
    console.log(genreList);

    const treemap = treeData => d3.treemap()
        .size([widthMap, heightMap])
        .padding(1)
        .round(true)(d3.hierarchy(treeData).sum(d => d.value).sort((a, b) => b.value - a.value));

    const SVG_HEADER = d3.select('.container')
        .append('svg')
        .attr('id', 'SVGHEADER')
        .attr('viewBox', [0, 0, w, 80]);

    const SVG_TREE_MAP = d3.select('.container')
        .append('svg')
        .attr('id', 'SVGMAP')
        .attr('viewBox', [0, 0, widthMap, heightMap]);

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
        .attr('id', 'title')
        .style('font-size', '1.2em')
        .style('font-weight', 'bold')
        .style('font-weight', 300)
        .text('Top 100 Highest Grossing Movies Grouped By Genre');

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const root = treemap(data);
    const leaf = SVG_TREE_MAP.selectAll('g')
        .data(root.leaves())
        .join('g')
        .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

    leaf.append('title')
        .text(d => 'tooltip');

    leaf.append('rect')
        .attr('id', (d, i) => 'rect' + i)
        .attr('fill', d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr('fill-opacity', 0.6)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0);

    leaf.append('clipPath')
        .attr('id', (d, i) => { console.log('leaf data', d); return 'clipPath' + i })
        .append('use')
        .attr('xlink:href', (d, i) => '#rect' + i);

    leaf.append('text')
        .attr('clip-path', (d, i) => `url(#clipPath${i})`)
        .selectAll('tspan')
        .data(d => {
            console.log(d.data.name.match(/[a-zA-Z]+\s\d+|[a-zA-Z]+/ig).filter(item => Boolean(item)))
            return d.data.name.match(/[a-zA-Z]+\s\d+|[a-zA-Z]+/ig).filter(item => Boolean(item));
        })
        .join('tspan')
        .attr('x', 3)
        .attr('y', (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
        .text(d => d);
});