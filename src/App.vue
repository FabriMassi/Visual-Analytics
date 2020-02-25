<template>
    <div id="app">
        <b-container fluid>
            <b-row align-h="center">
                <b-col>
                    <h5 align="center">Number of measurements by chemical</h5>
                    <div class='text-center'>
                    <b-row align-h="center" id='lpop_buttons'>
                        <b-form-group label="Select a slice" label-align="center">
                            <b-form-radio-group
                                button-variant= 'outline-primary'
                                size='sm'
                                v-model="lpop_buttons.value"
                                :options="lpop_buttons.options"
                                name="buttonsLolli"
                                buttons
                            ></b-form-radio-group>
                        </b-form-group>
                    </b-row>
                    </div>

                    <b-row align-h = "center" id='lpop_plot'>
                        <svg ref="svg_lolli" :height="lpop_conf.height" :width="lpop_conf.width">
                            <g class="g_lolli"></g>
                        </svg>
                    </b-row>

                    <br>
                        <div>
                            <b-row align-h="center" id='range_threshold'>
                                    <b-col sm="1">
                                        <div class='range_text'>
                                            <label for="range-1">Select a threshold value</label>
                                            <div class="mt-2">Value: {{ lpop_threshold_tmp }}</div>
                                        </div>
                                    </b-col>
                                    <b-form-input class='range' v-on:click="ChangeThreshold" id="range-1" v-model="lpop_threshold_tmp" type="range" step="1" min="0" :max="lpop_range.nice_max"></b-form-input>
                            </b-row>
                        </div>

                </b-col>
            </b-row>
            <b-row align-h="center" id='subplot_component'>
                <b-col>

                    <h4 align="center">Number of measurements by chemical and year (available:  {{bar_data_filtered.length}})</h4>

                    <div class="text-center">
                    <b-row align-h="center">
                        <b-form-group label="Select a group" label-align="center">
                            <b-form-radio-group 
                                size='sm'
                                button-variant= 'outline-primary'
                                v-model="bar_buttons.value"
                                :options="bar_buttons.options"
                                name="buttonsBarplots"
                                buttons
                            ></b-form-radio-group>
                        </b-form-group>
                    </b-row>
                    </div>

                    <subPlots :subplot_data='bar_data' :chem_names='chem_names'></subPlots>

                </b-col>
            </b-row>
        </b-container>
    </div>

</template>

<script>

import buildLollipop from './assets/Lollipop_plot'
import subPlots from './components/Subplots';

const d3 = require('d3');

export default {
  name: 'app',
  components: {
      subPlots,

  },
  data() {
    return {
      lpop_range: {max: 0, nice_max: 0},
      lpop_threshold_tmp: 0,
      lpop_threshold: 0,
      lpop_buttons: {
          value: 'top',
          options: ['top', 'middle-top', 'middle-bottom', 'bottom'],
      },
      lpop_data_tot: [], 
      lpop_data: [],
      lpop_conf: {
          width: 900,
          height: 600,
          margins: {top: 10, right: 30, bottom: 40, left: 270},
          x_top_margin: 0,
          x_right_margin: 0,
      },
      


      chem_names: [],
      bar_data_tot: [],
      bar_data_filtered: [],
      bar_data: [],
      bar_buttons: {
          value: '',
          options: [],
      },

      ts_buttons: {
          value: '', //'AGOC-3A',
          options: [], //['AGOC-3A', 'Chlorodinine', 'Methylosmoline'],
      },

      ts_data_tot: [],
      ts_data: [],
      timeseries_data: [],
      
      heat_data_tot: [],
      heat_data: [],

    }; 
  }, 

  mounted() {
    this.lpop_conf.x_top_margin = this.lpop_conf.height - this.lpop_conf.margins.top - this.lpop_conf.margins.bottom;
    this.lpop_conf.x_right_margin = this.lpop_conf.width - this.lpop_conf.margins.right - this.lpop_conf.margins.left;

    let g_lolli = d3.select("g.g_lolli")
        .attr("transform",
              "translate(" + (this.lpop_conf.margins.left-110) + "," + this.lpop_conf.margins.top + ")");

    g_lolli.append("g").classed("x_axis", true)

    g_lolli.append("g").classed("y_axis", true);
    g_lolli.append("line").classed("threshold", true);
        
    // DATI PER LOLLIPOP
    d3.csv('./data/Lolli_data.csv').then(data => {

        this.lpop_data_tot = data.map(d => {
            return {
                key: d.measure.trim(),
                value: +d.count
            }
        })

        this.lpop_data_tot.sort(function(a,b) {
            return b.value - a.value;
        });

        this.lpop_data = this.lpop_data_tot.slice(0, 28);
        this.lpop_range.nice_max = 5500;
        this.lpop_threshold = Math.floor(this.lpop_range.nice_max/2);
        this.lpop_threshold_tmp = Math.floor(this.lpop_range.nice_max/2);
         
        const my_lolli = buildLollipop()
            .width(this.lpop_conf.width)
            .heigth(this.lpop_conf.height)
            .margins(this.lpop_conf.margins)
            .threshold(this.lpop_threshold)
        
        g_lolli.datum(this.lpop_data).call(my_lolli); 

        }),


        // DATI PER SUBPLOT DI BAR PLOTS

        d3.csv('./data/data_chem_year_final.csv').then(data => {    
        const reports_2 = data.map(d => {
            return {
               chemical : d.chemical.trim(),
               sample_year: d.sample_year,
               count: d.count 
            }
        })

        this.chem_names = this.lpop_data_tot.map(d => d.key);
        
        var length = this.chem_names.length;
        var i = 0;
        for(i=0; i<length; i++) {
            this.bar_data_tot.push(reports_2.filter(d => {return d.chemical==this.chem_names[i]}));
        }

        let tmp_chem = this.lpop_data_tot.filter(d => {return d.value >= this.lpop_threshold}).map(d => d.key);
        this.bar_data_filtered = this.bar_data_tot.slice(0, tmp_chem.length);

        this.bar_buttons.options = ['top']
        this.bar_buttons.value = 'top'
        this.bar_data = this.bar_data_filtered;
        
        })
      
  },//mounted
  methods: {
      ChangeThreshold: function() {
          this.lpop_threshold = this.lpop_threshold_tmp;
      },
  },

  watch: {
       lpop_buttons: {
            handler(newval) {

              if (newval.value === "top") {
                  this.lpop_data = this.lpop_data_tot.slice(0, 28);
                  this.lpop_range.nice_max = 5500;
              }
              else if (newval.value === "middle-top") {
                  this.lpop_data = this.lpop_data_tot.slice(28, 56);
                  this.lpop_range.nice_max = 2200;
              }
              else if (newval.value === "middle-bottom") {
                  this.lpop_data = this.lpop_data_tot.slice(56, 84);
                  this.lpop_range.nice_max = 500;
              }
              else {
                  this.lpop_data = this.lpop_data_tot.slice(84, 106);
                  this.lpop_range.nice_max = 90;
              }


            let g_lolli = d3.select("g.g_lolli")


            // BUILDING PLOT
            const my_lolli = buildLollipop()
                .width(this.lpop_conf.width)
                .heigth(this.lpop_conf.height)
                .margins(this.lpop_conf.margins)
                .threshold(this.lpop_threshold)

            g_lolli.datum(this.lpop_data).call(my_lolli);

          },
          deep: true
      },

      lpop_threshold: {
          handler(newval) {

            let g_lolli = d3.select("g.g_lolli")


            // BUILDING PLOT
            const my_lolli = buildLollipop()
                .width(this.lpop_conf.width)
                .heigth(this.lpop_conf.height)
                .margins(this.lpop_conf.margins)
                .threshold(newval)

            g_lolli.datum(this.lpop_data).call(my_lolli);

            // DEVO OCCUPARMI ANCHE DEI DATI DEL SUBPLOT
            let tmp_chem = this.lpop_data_tot.filter(d => {return d.value >= newval}).map(d => d.key);
            this.bar_data_filtered = this.bar_data_tot.slice(0, tmp_chem.length);

            let n_chem = this.bar_data_filtered.length;


            if (n_chem > 84) {this.bar_buttons.options = ['top', 'middle-top', 'middle-bottom', 'bottom']}

            else if (n_chem <= 28) {

                if (n_chem == 0) {
                    this.bar_buttons.options = [];
                    this.bar_buttons.value = '';
                }
                else {
                    this.bar_buttons.options = ['top']
                    this.bar_buttons.value = 'top'
                }
            }
            else if (n_chem > 28 && n_chem <= 56) {
                this.bar_buttons.options = ['top', 'middle-top']
                if (this.bar_buttons.value == 'middle-bottom' || this.bar_buttons.value == 'bottom') {
                    this.bar_buttons.value = 'middle-top'
                }
            }
            else {
                this.bar_buttons.options = ['top', 'middle-top', 'middle-bottom']
                if (this.bar_buttons.value == 'bottom') {this.bar_buttons.value = 'middle-bottom'}
            }

          },
      },

      
      bar_buttons: {
          handler(newval) {

              let n_chem = this.bar_data_filtered.length;

              if (n_chem == 0) {this.bar_data = []}

              else if (newval.value === 'top') {
                  if (n_chem >= 28) {this.bar_data = this.bar_data_filtered.slice(0, 28)}
                  else {this.bar_data = this.bar_data_filtered}
              }
              else if (newval.value === 'middle-top') {
                  //if (n_chem > 28) {
                      if (n_chem > 56) {this.bar_data = this.bar_data_filtered.slice(28, 56)}
                      else {this.bar_data = this.bar_data_filtered.slice(28)}
                  //}
              }
              else if (newval.value === 'middle-bottom') {
                  //if (n_chem > 56) {
                      if (n_chem > 84) {this.bar_data = this.bar_data_filtered.slice(56, 84)}
                      else {this.bar_data = this.bar_data_filtered.slice(56)}
              }
              else {
                  //if (n_chem > 82) {
                      this.bar_data = this.bar_data_filtered.slice(84)
                  //}
              }
          },
          deep: true
      },

  } 




}
</script>

<style>

.range_text {
    position: relative;
    top: -40px;
    left: -50px;
}

.range {
    width: 615px;
    position: relative;
    left: -53px;
}



  
.d3-tip {
  line-height: 1;
  font-weight: bold;
  font-size: 12px;
  padding: 8px;
  margin: 0 0 0 5px;
  background:rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 10px;
  pointer-events: none;
}

/* Creates a small triangle extender for the tooltip */
.d3-tip:after {
  box-sizing: border-box;
  display: inline;
  font-size: 10px;
  width: 100%;
  line-height: 1;
  color: rgba(0, 0, 0, 0.8);
  position: absolute;
  pointer-events: none;
}

/* Northward tooltips */
/* .d3-tip.n:after {
  content: "\25BC";
  margin: -1px 0 0 0;
  top: 100%;
  left: 0;
  text-align: center;
} */

/* Eastward tooltips */
.d3-tip.e:after {
  content: "\25C0";
  margin: -4px 0 0 0;
  top: 50%;
  left: -8px;
}

/* Southward tooltips */
/* .d3-tip.s:after {
  content: "\25B2";
  margin: 0 0 1px 0;
  top: -8px;
  left: 0;
  text-align: center;
} */

/* Westward tooltips */
/* .d3-tip.w:after {
  content: "\25B6";
  margin: -4px 0 0 -1px;
  top: 50%;
  left: 100%;
}  */
</style>
