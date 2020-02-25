<template>
<div>
    <b-container>
    <b-row align-h="center" id='subplot'>
        <vue-plotly v-if="subplotShow" id="plotly_id" @click='click' :data="sub_data" :layout="sub_layout" :options="sub_options"/>  <!-- v-if='subplotShow' -->
    </b-row>

    <br><br>

    <b-row align-h="center">
        <h4 align="center">Chemical(s) values during time</h4> 
    </b-row>
    <b-row align-h="center">
        <p align="center">Note: values are between 0 and 1. You can also see real values on hover</p><br><br>
    </b-row>

    <b-row align-h="center" id='reset_button'>
        <b-button v-if='resetShow' @click="resetClick" variant="outline-danger" size='sm'>Reset All</b-button>
    </b-row> <br>

    <b-row align-h="center">
        <b-col md='8'>
            <b-form-tags 
            v-model="selected_chem" 
            :tag-validator='validator' 
            tag-variant='success'
            placeholder='Write here a chemical name or click on desired chemical in the plot above'
            remove-on-delete
            ></b-form-tags>
        </b-col>
    </b-row>
    <br><br>

    <b-row align-h="center" id='time_series_plot'>
        <vue-plotly v-if='resetShow' :data="ts_data" :layout="ts_layout" :options="ts_options"/>
    </b-row>

    <b-row align-h="center" id='heatmap_button'>
        <b-col md=2>
            <b-form-select v-if='resetShow' v-model="heat_selected" :options="selected_chem" size='sm'></b-form-select>
        </b-col>
    </b-row> <br>
    <!-- <h4 align="center">Chemical values by location</h4> -->
    <b-row align-h="center" id='heatmap' v-if='resetShow'>
        <h4 align="center">Chemical values by location</h4>
        <vue-plotly :data="heat_data" :layout="heat_layout" :options="heat_options"/>
    </b-row>

    

    </b-container>
</div>
</template>

<script>
import VuePlotly from '@statnett/vue-plotly';
const d3 = require('d3')

export default {
  name: 'subPlots',
  components: {
    VuePlotly,
  },
  props: {
    subplot_data: Array,
    chem_names: Array,
  },
  data() {
    return {
      options_prova: ['Chromium', 'Manganese', 'banana', 'mela'],

      sub_data: [],
      sub_layout: {
        grid: {rows: 4, columns: 7, pattern: 'independent'},
        title: {text:''},
        height: 0,
        width: 1400,
        margin: {
          t: 10,
          l: 70,
          b: 60,
          r: 10,
          pad: [0]
        },         
        annotations: [],
      },
      sub_options: {
        displayModeBar: false,
      },      

      selected_chem: [], // contiene tutti i chemical selezionati sul subplot tramite click o tramite tag
      ts_plot_maxlines: 5,
      chem_std_mean: [],
      ts_data_tot: [],
      ts_data: [],
      ts_layout: {
          width: 1300,
          height: 500,
          margin: {t:20},
          xaxis: {showgrid: false}
      },
      ts_options: {
          scrollZoom: false,
          displaylogo: false,
          dragmode: 'zoom',
          modeBarButtonsToRemove: ['toImage',  'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'toggleSpikelines', 
                                   'hoverClosestCartesian', 'hoverCompareCartesian']
      },

      heat_selected: '',
      heat_data_tot: [],
      heat_data: [],
      heat_layout: {
          xaxis: {title: 'Date'},
          yaxis: {title: 'Location'},
          zaxis: {title: 'Value'},
          width: 1300,
          height: 600,
          margin: {t:50},
      },
      heat_options: {
          displaylogo: false,
          scrollZoom: false,
          modeBarButtonsToRemove: ['toImage',  'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'toggleSpikelines', 
                                   'hoverClosestCartesian', 'hoverCompareCartesian']
      },


    };
  },

  mounted() {

        // DATI PER TIME SERIES PLOT
        //Promise.all([d3.csv('./data/data_time_chemical.csv'),
        Promise.all([d3.csv('./data/data_time_chemical(month).csv'), 
                     d3.csv('./data/chem_std_mean.csv'),
                     d3.csv('./data/Heatmap_data.csv'),]).then(files => {
        
            this.ts_data_tot = files[0].map(d => {
                return {
                    chemical: d.chemical.trim(),
                    sample_date: d.sample_date,
                    value: +d.value
                }
            })

            this.chem_std_mean = files[1].map(d => {
                return {
                    chemical : d.measure.trim(),
                    mean: d.mean,
                    std: d.std
                }
            })

            this.heat_data_tot = files[2].map(d => {
                if(d.value == '') {
                    return {
                        chemical: d.chemical.trim(),
                        location: d.location,
                        date: d.date,
                        value: null
                    }
                }
                else {
                    return {
                        chemical: d.chemical.trim(),
                        location: d.location,
                        date: d.date,
                        value: +d.value
                    }
                }
            })

            this.selected_chem = [];
            this.heat_selected = '';
            
        })

/*         var my_plot = document.getElementById('plotly_id')
        my_plot.on('plotly_hover', function(event){
            let curr_year = event.points[0].x
            let idx = event.points[0].data.x.indexOf(curr_year)
            let new_marker = new Array(event.points[0].data.marker.color.length).fill('#007bff');
            new_marker[idx] = '#CA3C25'
            event.points[0].data.marker.color = new_marker

        })
        .on('plotly_unhover', function(event) {
            let new_marker = new Array(event.points[0].data.marker.color.length).fill('#007bff');
            event.points[0].data.marker.color = new_marker  
        }) */



  },

  updated() {
        if (this.subplot_data.length != 0) {
            var my_plot = document.getElementById('plotly_id')
            my_plot.on('plotly_hover', function(event){
                let curr_year = event.points[0].x
                let idx = event.points[0].data.x.indexOf(curr_year)
                let new_marker = new Array(event.points[0].data.marker.color.length).fill('#007bff');
                new_marker[idx] = '#CA3C25'
                event.points[0].data.marker.color = new_marker

            })
            .on('plotly_unhover', function(event) {
                let new_marker = new Array(event.points[0].data.marker.color.length).fill('#007bff');
                event.points[0].data.marker.color = new_marker  
            })
        }

      d3.select('#heatmap').select("g.g-xtitle").select('text').remove()

  },

  methods : {

      click: function(event) {
          //let chem_tmp = this.selected_chem;
          let selected_chem_tmp = [...this.selected_chem];

          let chem_idx = selected_chem_tmp.indexOf(event.points[0].data.name);
          if (chem_idx == -1){
              selected_chem_tmp.push(event.points[0].data.name);
          }
          else {
            selected_chem_tmp.splice(chem_idx, 1);
          }

          if (selected_chem_tmp.length > this.ts_plot_maxlines) {
              alert ('You\'ve already selected ' + this.ts_plot_maxlines + ' chemicals!\n' + selected_chem_tmp.slice(-1) + ' will not be added in the plot below');
              selected_chem_tmp.splice(-1, 1);
          }
          this.selected_chem = selected_chem_tmp;
      },

      resetClick: function() {
          this.selected_chem = [];
      },

      validator: function(tag) {
          //let cond1 = this.chem_names.indexOf(tag) != -1;
          let lowercase_chem_names = this.chem_names.map(d => d.toLowerCase())
          let cond2 = lowercase_chem_names.indexOf(tag.toLowerCase()) != -1
          return cond2
      }
  },

  computed: {
      subplotShow() {
          return this.subplot_data.length != 0
      },
      resetShow() {
          return this.selected_chem.length == 0 ? false : true
      }

  },


  watch: {
    subplot_data(new_arr) {
      this.sub_data = [];
      this.sub_layout.annotations = [];
      var tmp_data = [];
      var tmp_annotations = [];
      var length = new_arr.length;
    
      if (length == 0) { this.sub_layout.grid = {rows: 1, columns: 0} } 
      else {this.sub_layout.grid = {rows: Math.ceil(length/7), columns: 7, pattern: 'independent'}}
      
      var i = 0;
      for (i=0; i<length; i++) {
          let n = i + 1;
          let tmp_cat = new_arr[i][0].chemical;

          let tmp_trace = {
              name: tmp_cat, 
              x: new_arr[i].map(d => d.sample_year),
              y: new_arr[i].map(d => d.count),
              xaxis: 'x' + n.toString(),
              yaxis: 'y' + n.toString(),
              type: 'bar',
              width: 0.5,
              hoverinfo: 'y',
              showlegend: false,
              visible: true,
              marker: {color: ['#007bff']},
          }

          tmp_trace.marker.color = new Array(tmp_trace.x.length).fill('#007bff');

          let xaxis_n = n == 1 ? 'xaxis' : 'xaxis' + n.toString()
          let yaxis_n = n == 1 ? 'yaxis' : 'yaxis' + n.toString()
          this.sub_layout[xaxis_n] = {type: 'category', tickangle: 90, fixedrange: true}
          this.sub_layout[yaxis_n] = {fixedrange: true}

          tmp_annotations.push({text: tmp_cat.slice(0,18), xref: 'x' + n.toString(), yref: 'y' + n.toString(), 
                                showarrow: false, y: 0, yanchor: 'top',})

          tmp_data.push(tmp_trace);
      }// fine for loop

      this.sub_data = tmp_data;
      this.sub_layout.annotations = tmp_annotations;
      this.sub_layout.height = 160 * this.sub_layout.grid.rows;
    

    
    },
    selected_chem: {
        handler(new_arr, old_arr) {

        
        //SE NON HO CHEMICAL SELEZIONATI, QUANDO SELEZIONO IL PRIMO VOGLIO CHE VENGA VISUALIZZATA L'HEATMAP DI QUEL CHEMICAL
        if ((old_arr.length == 0) && (new_arr.length != 0)) {
            this.heat_selected = new_arr[0]
        }

        if (new_arr.length > this.ts_plot_maxlines) {

            alert ('You\'ve already selected ' + this.ts_plot_maxlines + ' chemicals!\n' + this.selected_chem.slice(-1) + 
                   ' tag will not be added');
            //this.selected_chem.splice(-1, 1)
            this.selected_chem = this.selected_chem.slice(0, -1)
        }

        else { 
        
            // CONTROLLO SE E' SCRITTO IN LOWERCASE
            if((this.chem_names.indexOf(new_arr.slice(-1)[0]) == -1) && new_arr.length != 0) {
                let lowerchem = new_arr.slice(-1)[0].toLowerCase()
                
                let lowercase_chem_names = this.chem_names.map(d => d.toLowerCase())
                let tmp_idx = lowercase_chem_names.indexOf(lowerchem)
                let corrected_chem = this.chem_names[tmp_idx]

                //this.selected_chem.splice(-1, 1, corrected_chem)
                let selected_chem_tmp = [...this.selected_chem].slice(0, -1)
                selected_chem_tmp.push(corrected_chem)
                this.selected_chem = selected_chem_tmp
            }

            else {

                // CONTROLLO SE IL CHEMICAL SELEZIONATO PER L'HEATMAP ESISTE ANCORA
                if (new_arr.indexOf(this.heat_selected)==-1) {
                    this.heat_selected = new_arr.slice(0)[0]
                }
            
                var tmp_data = [];
                for(var i=0; i<new_arr.length; i++) {
                    
                    let chem_name = new_arr[i];
                    let chem_data = this.ts_data_tot.filter(d => {return d.chemical==chem_name})
                    let chem_mean_std = this.chem_std_mean.filter(d => {return d.chemical==chem_name})[0];
                    
                    // IL SECONDO MAPPING E' PER ARROTONDARLI ALLA SECONDA CIFRA
                    let tmp_real = chem_data.map(d => d.value).map(d => Math.round((d + Number.EPSILON) * 100) / 100)
                    ///////////////////////////////////////////////
                    // Z-SCORE
                    //let tmp_normalized = chem_data.map(d => ((d.value - chem_mean_std.mean)/chem_mean_std.std)).map(d => Math.round((d + Number.EPSILON) * 100) / 100)
                    
                    // MIN MAX
                    let value_arr = chem_data.map(d => d.value)
                    let tmp_max = d3.max(chem_data, function(d) {return d.value}) 
                    let tmp_min = d3.min(chem_data, function(d) {return d.value}) 

                    let tmp_normalized = chem_data.map(d => ((d.value - tmp_min)/(tmp_max - tmp_min))).map(d => Math.round((d + Number.EPSILON) * 100) / 100)
                    ///////////////////////////////////////////////
                    
                    let tmp_template = tmp_normalized.map((d,i) => {
                        return 'Norm val: ' + d.toString() + '<br>' + 'Real val: ' + tmp_real[i].toString()
                    })

                    let trace = {
                        name: chem_name,
                        x: chem_data.map(d => d.sample_date),
                        y: tmp_normalized,
                        //text: chem_data.map(d => {return 'Real Value: ' + Math.round((d.value + Number.EPSILON) * 100) / 100}),     
                        hovertemplate: tmp_template,
                        mode: 'lines',
                        line: {shape: 'spline', smoothing: 0.5}
                    }
                    tmp_data.push(trace) 

                }
                this.ts_data = tmp_data
            }
        }
    },
    deep: true,
    },

    heat_selected(newval) {

        let data_chemical = this.heat_data_tot.filter(d => d.chemical==newval)
        let tmp_max = d3.max(data_chemical, function(d) {return d.value})
        let tmp_min = d3.min(data_chemical, function(d) {return d.value})

        let trace = {
            z: [], 
            x: [], 
            y: [], 
            type: 'heatmap', 
            hoverongaps: false,
            hoverinfo: 'text',
            text: [],
            colorscale: [[0, 'blue'], [0.25, 'green'], [0.5, 'yellow'], [0.75, 'orange'], [1, 'red']],//'RdBu'
            //hovertemplate: [],
            //colorscale: 'BlueRed', 
            };
        
        var dates_arr = [];

        let locations = ['Decha','Achara','Tansanee', 'Sakda','Kannika','Chai', 'Kohsoom','Boonsri','Somchair','Busarakhan']//['Decha', 'Achara', 'Tansanee', 'Boonsri', 'Kohsoom', 'Somchair', 'Busarakhan', 'Sakda', 'Kannika']
        let loc_len = locations.length;

        dates_arr = data_chemical.map(d => d.date)
        var dates_arr_len = dates_arr.length;

        dates_arr.sort(function(a,b) {
            let a1 = Date.parse(a);
            let b1 = Date.parse(b);
            return a1 - b1;
        });

        trace.x = dates_arr;
        trace.y = locations;
        let real_value_prova = []

        for(let i=0; i<loc_len; i++) {
            let tmp_data = data_chemical.filter(d => d.location==locations[i]);
            let tmp_dates = tmp_data.map(d => d.date); // contiene tutte le date per un certo chemical nel luogo i
            let trace_row = [];
            for(let j=0; j<dates_arr_len; j++) {
                let date_to_find = dates_arr[j];
                let pos = tmp_dates.findIndex(el => el == date_to_find);
                trace_row.push(tmp_data[pos].value);
                
            }

            // MIN MAX NORM
            ///////////////////////////////////////////////
            let trace_row_norm = trace_row.map(function(d) {
                if(d == null) {return d}
                else {
                    let new_d = (d - tmp_min)/(tmp_max - tmp_min)
                    return Math.round((new_d + Number.EPSILON) * 100) / 100
                }})
            ///////////////////////////////////////////////


            trace.z.push(trace_row_norm);
            trace.text.push(trace.x.map((d,i) => {
                if(trace_row[i]==null) {
                    return 'Date: ' + d.toString() + '<br>' + 'Value: ' + 'null'}
                else {return 'Date: ' + d.toString() + '<br>' + 'Norm val: ' + trace_row_norm[i].toString() + '<br>' + 'Real val: ' + trace_row[i].toString()}
                }))
            //trace.text.push = new Array(trace_row.length).fill('CIAO');
        }
        this.heat_data = [trace];

        let axistemplate = {
            //title: 'Location',
            showgrid: false,
            zeroline: false,
            nticks: 10,
            showline: false,
            mirror: 'all',
        };

        this.heat_layout.xaxis.title = 'Date'
        this.heat_layout.zaxis.title = 'Value'
        this.heat_layout.yaxis = axistemplate;
    }
  },
};
</script>


<style>

.js-plotly-plot .plotly .modebar {
    left: 68%;
    transform: translateX(-68%);
}


</style>