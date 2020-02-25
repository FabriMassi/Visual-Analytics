import d3Tip from "d3-tip";
let d3 = require('d3');

d3.tip = d3Tip;
/* Initialize tooltip */
var tip = d3Tip().attr('class', 'd3-tip').html(function(d) { return d.value; });
tip.direction('e');


export default function buildLollipop() {
    let width = 500;
    let height = 500;
    let margins = {top: 0, right: 0, bottom: 0, left: 0}
    let circle_r = 5;
    let threshold = -1

    function me(selection) {
        selection.call(tip);
        let x_top_margin = height - margins.top - margins.bottom;
        let x_right_margin = width - margins.left - margins.right;
        let my_data = selection.datum();
        var x_max = d3.max(my_data, function(d) {return d.value})


        //if (x_max < threshold) {x_max = threshold}
        
        // X axis  
        var x = d3.scaleLinear()
          .domain([0, x_max])
          .range([0, x_right_margin])
          .nice()

        selection.select("g.x_axis")
          .attr("transform", "translate(0," + x_top_margin + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

         // Y axis
        var y = d3.scaleBand()
          .range([ 0, x_top_margin])
          .domain(my_data.map(function(d) {return d.key}))
          .padding(1);

        selection.select("g.y_axis")
          .call(d3.axisLeft(y));
        

        // Threshold
        if(threshold != -1) {
            selection.select("line.threshold")
                .attr("x1", x(threshold))
                .attr("x2", x(threshold))
                .attr("y1", x_top_margin)
                .attr("y2", 0)
                .attr("stroke", "brown")
                .attr('stroke-width', 1.5)
        }   
        

        // LINES
        var lines = selection.selectAll('line.my_line')
          .data(my_data);

        
        lines.enter().append("line")
          .classed("my_line", true)
          .merge(lines)
            .attr("x1", function(d) {return x(d.value); })
            .attr("x2", x(0))
            .attr("y1", function(d) { return y(d.key); })
            .attr("y2", function(d) { return y(d.key); })
            .attr("stroke", "grey")
            .on('mouseover', function(d) {
                let chem_name = d.key;
                d3.select(this)
                    .attr("stroke", "#CA3C25")
                    .attr("stroke-width", 1.5);
                let tmp_tick = d3.select(this.parentNode)
                  .select('g.y_axis')
                  .selectAll('g.tick')
                    .filter(function() {
                        return d3.select(this).text() == chem_name
                    })

                tmp_tick.select("text")
                  .attr('fill', '#CA3C25')
                tmp_tick.select("line")
                  .attr('stroke', '#CA3C25')
                  .attr('stroke-width', 1.5)

            })
            .on('mouseout', function(d){
                let chem_name = d.key;
                d3.select(this)
                    .attr('stroke', 'grey')
                    .attr('stroke-width', 1);
                let tmp_tick = d3.select(this.parentNode)
                  .select('g.y_axis')
                  .selectAll("g.tick")
                    .filter(function() {
                        return d3.select(this).text() == chem_name
                    })
                
                tmp_tick.select('text')
                  .attr('fill', 'black')
                tmp_tick.select('line')
                  .attr('stroke', 'black')
                  .attr('stroke-width', 1)
            })

        lines.exit().remove();

        // CIRCLES
        var circles = selection.selectAll("circle")
          .data(my_data);
        
        circles.enter().append("circle")
          .merge(circles)
            .attr("cx", function(d) {return x(d.value); })
            .attr("cy", function(d) { return y(d.key); })
            .attr("r", function(d) {
                if (d.value < threshold) {return circle_r-2}
                else {return circle_r}
            })
            .style("fill", function(d) {
                if(d.value < threshold) {return '#EB9486'}
                else {return '#52B788'}//"#69b3a2" #5398BE 
            })
            .attr("stroke", function(d) {
                if(d.value < threshold) {return 'black'}
                else {return 'black'}
            })
            .on('mouseover.tip', tip.show)
            .on('mouseover.line', function(d) {
                let chem_name = d.key;
                let y_val = y(d.key);
                let g_lolli = d3.select(this.parentNode)
                g_lolli.selectAll("line")
                  .filter(function() {return d3.select(this).attr('y1') == y_val})
                    .attr("stroke", "#CA3C25")
                    .attr("stroke-width", 1.5);
                let tmp_tick = g_lolli.select('g.y_axis')
                  .selectAll("g.tick")
                    .filter(function() {
                        return d3.select(this).text() == chem_name
                    })

                tmp_tick.select("text")
                  .attr('fill', '#CA3C25')
                tmp_tick.select("line")
                  .attr('stroke', '#CA3C25')
                  .attr('stroke-width', 1.5)

            })

            .on('mouseout.tip', tip.hide)
            .on('mouseout.line', function(d) {
                let chem_name = d.key;
                let y_val = y(d.key);
                let g_lolli = d3.select(this.parentNode)
                g_lolli.selectAll("line")
                  .filter(function() {return d3.select(this).attr('y1') == y_val})
                    .attr("stroke", "grey")
                    .attr("stroke-width", 1);
                let tmp_tick = g_lolli.select('g.y_axis')
                  .selectAll("g.tick")
                    .filter(function() {
                        return d3.select(this).text() == chem_name
                    })

                tmp_tick.select("text")
                  .attr('fill', 'black')
                tmp_tick.select("line")
                  .attr('stroke', 'black')
                  .attr('stroke-width', 1)
            })

            //.attr("v-b-tooltip.hover", function(d) {return d.value})

        circles.exit().remove();       
        
    }

    me.width = function(_width){
        if (!arguments.length) return width;
        width = _width;
    
        return me;
    }
    me.heigth = function(_height){
        if (!arguments.length) return height;
        height = _height;
    
        return me;
    }
    me.margins = function(_margins){
        if (!arguments.length) return margins;
        margins = _margins;
    
        return me;
    }
    me.circle_r = function(_circle_r){
        if (!arguments.length) return circle_r;
        circle_r = _circle_r;
    
        return me;
    }
    me.threshold = function(_threshold){
        if (!arguments.length) return threshold;
        threshold = _threshold;
    
        return me;
    }
    
    return me;
}
